import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import { Canvas } from 'fabric';

import { useCanvasContext } from '@/hooks/useCanvasContext';
import {
  loadDesignIntoCanvas,
  loadTemplateIntoCanvas,
} from '@/utils/loadTemplate';
import {
  fitCanvasToContainer,
  refreshObjectBaseline,
} from '@/utils/canvasSettings';
import { initAlignmentGuides } from '../../utils/alignment/alignmentGuides';

const CanvasEditor = ({ isPreviewMode = false }) => {
  const canvasRef = useRef(null);

  // Used to group multiple object:added events
  // into one history entry
  const addHistoryTimeoutRef = useRef(null);

  const {
    canvasEditor,
    setCanvasEditor,
    setSize,
    setOrientation,
    setName,
    saveHistory,
    resetHistory,
    isHistoryRestoring,
  } = useCanvasContext();

  const { id } = useParams();
  const location = useLocation();

  const template = location.state?.template;

  // Get existing design from Redux
  const design = useSelector(({ designs }) => {
    if (!id) return null;

    return designs.find((item) => item.id === id) || null;
  });

  const canvasData = design?.canvasData;

  const hasLoadedDataRef = useRef(false);

  // --------------------------------------------------
  // CREATE CANVAS
  // --------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current) return;

    // enableRetinaScaling already handles the device
    // pixel ratio internally — don't also scale
    // width/height/zoom by hand here, or the canvas
    // ends up double-scaled and later math in
    // applyPageSettings / fitCanvasToContainer (which
    // assumes CSS-pixel dimensions) goes wrong.
    const initialCanvas = new Canvas(canvasRef.current, {
      width: 1280 / 1.5,
      height: 720 / 1.5,
      backgroundColor: 'white',
      enableRetinaScaling: true,
    });

    initialCanvas.renderAll();

    // First canvas state
    resetHistory(initialCanvas);

    setCanvasEditor(initialCanvas);

    return () => {
      initialCanvas.dispose();
    };
  }, [resetHistory, setCanvasEditor]);

  // --------------------------------------------------
  // LOAD SAVED DESIGN
  // --------------------------------------------------
  useEffect(() => {
    if (!canvasEditor || !canvasData || hasLoadedDataRef.current) {
      return;
    }

    const loadSavedDesign = async () => {
      try {
        // loadDesignIntoCanvas applies the design's
        // saved page size/orientation (applyPageSettings)
        // and fits the canvas to its container
        // (finishCanvasLoad -> fitCanvasToContainer)
        // BEFORE/around loading the objects — without
        // this, the canvas keeps its default 1280x720
        // dimensions and the design's content doesn't
        // fit/align correctly.
        await loadDesignIntoCanvas(canvasEditor, design);

        // Now that the design is loaded, treat it as
        // the starting point for undo/redo history.
        resetHistory(canvasEditor);

        hasLoadedDataRef.current = true;
      } catch (error) {
        console.error('Error loading saved design:', error);
      }
    };

    loadSavedDesign();
  }, [canvasEditor, canvasData, design, resetHistory]);

  // --------------------------------------------------
  // ALIGNMENT GUIDES
  // --------------------------------------------------
  useEffect(() => {
    if (!canvasEditor) return;

    const cleanupAlignmentGuides = initAlignmentGuides(canvasEditor, {
      snappingThreshold: 8,
      releaseThreshold: 12,
    });

    return cleanupAlignmentGuides;
  }, [canvasEditor]);

  // --------------------------------------------------
  // FIT CANVAS TO CONTAINER
  // --------------------------------------------------
  useEffect(() => {
    if (!canvasEditor) return;

    fitCanvasToContainer(canvasEditor);

    const handleResize = () => {
      fitCanvasToContainer(canvasEditor);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasEditor]);

  // --------------------------------------------------
  // LOAD TEMPLATE
  // --------------------------------------------------
  useEffect(() => {
    if (!template || !canvasEditor) return;

    const loadTemplate = async () => {
      try {
        await loadTemplateIntoCanvas(
          canvasEditor,
          setSize,
          setOrientation,
          template,
          setName
        );

        // Template becomes starting history state
        resetHistory(canvasEditor);
      } catch (error) {
        console.error('Error loading template:', error);
      }
    };

    loadTemplate();
  }, [template, canvasEditor, setSize, setOrientation, setName, resetHistory]);

  // --------------------------------------------------
  // UNDO / REDO HISTORY EVENTS
  // --------------------------------------------------
  useEffect(() => {
    if (!canvasEditor) return;

    // -----------------------------------------------
    // OBJECT MODIFIED
    // -----------------------------------------------
    const handleModified = (event) => {
      // Ignore changes caused by Undo/Redo
      if (isHistoryRestoring()) {
        console.log('MODIFIED IGNORED - RESTORING');
        return;
      }

      const target = event.target;

      console.log('OBJECT MODIFIED → SAVE HISTORY');

      if (target) {
        console.log('OBJECT POSITION:', {
          left: target.left,
          top: target.top,
          angle: target.angle,
          scaleX: target.scaleX,
          scaleY: target.scaleY,
        });
      }

      // Keep the team's object baseline updated
      if (target) {
        refreshObjectBaseline(canvasEditor, target);
      }

      // Save one history entry for the completed
      // move / resize / rotate action
      saveHistory(canvasEditor);
    };

    // -----------------------------------------------
    // OBJECT ADDED
    // -----------------------------------------------
    const handleAdded = (event) => {
      if (isHistoryRestoring()) {
        console.log('ADDED IGNORED - RESTORING');
        return;
      }

      console.log('OBJECT ADDED');

      // Keep the team's baseline updated for
      // newly created objects
      if (event.target) {
        refreshObjectBaseline(canvasEditor, event.target);
      }

      // Cancel previous pending save
      clearTimeout(addHistoryTimeoutRef.current);

      // Wait briefly so multiple object:added
      // events from the same action are grouped
      // into one history entry.
      addHistoryTimeoutRef.current = setTimeout(() => {
        if (isHistoryRestoring()) {
          console.log('ADD HISTORY IGNORED - RESTORING');
          return;
        }

        console.log('SAVE HISTORY AFTER ADD');

        saveHistory(canvasEditor);
      }, 100);
    };

    // -----------------------------------------------
    // REGISTER FABRIC EVENTS
    // -----------------------------------------------
    canvasEditor.on('object:modified', handleModified);

    canvasEditor.on('object:added', handleAdded);

    // -----------------------------------------------
    // CLEANUP
    // -----------------------------------------------
    return () => {
      canvasEditor.off('object:modified', handleModified);

      canvasEditor.off('object:added', handleAdded);

      clearTimeout(addHistoryTimeoutRef.current);

      addHistoryTimeoutRef.current = null;
    };
  }, [canvasEditor, saveHistory, isHistoryRestoring]);

  // --------------------------------------------------
  // QUICK PREVIEW MODE
  // --------------------------------------------------
  // While previewing, objects shouldn't be selectable/editable so it
  // behaves like a clean read-only view of the certificate. Restore the
  // objects' own selectable/evented flags when preview is exited.
  useEffect(() => {
    if (!canvasEditor) return;

    canvasEditor.discardActiveObject();
    canvasEditor.selection = !isPreviewMode;

    canvasEditor.forEachObject((obj) => {
      obj.selectable = !isPreviewMode;
      obj.evented = !isPreviewMode;
    });

    canvasEditor.renderAll();
  }, [canvasEditor, isPreviewMode]);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <div className='canvas-responsive-container'>
      <canvas id='canvas' ref={canvasRef}></canvas>
    </div>
  );
};

export default CanvasEditor;
