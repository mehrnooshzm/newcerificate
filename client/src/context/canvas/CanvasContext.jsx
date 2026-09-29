import { useState, useEffect, useRef, useCallback } from 'react';
import { createContext } from 'react';
import { FabricObject } from 'fabric';
import {
  applyPageSettings,
  clearPageSizeTracking,
  fitCanvasToContainer,
} from '@/utils/canvasSettings';

// Extend Fabric.js object serialization to include custom properties
FabricObject.prototype.toObject = (function (toObject) {
  return function (propertiesToInclude) {
    return toObject.call(
      this,
      (propertiesToInclude || []).concat(['selectable', 'evented'])
    );
  };
})(FabricObject.prototype.toObject);

export const CanvasContext = createContext(null);

export const CanvasProvider = ({ children }) => {
  const [canvasEditor, setCanvasEditor] = useState(null);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Keep history immediately synchronized
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);

  // True while Fabric is restoring a previous state
  const isRestoring = useRef(false);

  // Prevent multiple Undo/Redo operations from running at the same time
  const historyOperationInProgress = useRef(false);

  const isHistoryRestoring = useCallback(() => {
    return isRestoring.current;
  }, []);

  // --------------------------------------------------
  // PAGE SETTINGS (size / orientation / custom dims)
  // --------------------------------------------------
  // These live outside the Fabric canvas JSON entirely (canvas.toJSON()
  // never includes width/height), so they must be captured and restored
  // as part of every history snapshot — otherwise Undo/Redo only restores
  // the OBJECTS while leaving the canvas at whatever size/orientation it
  // currently happens to be, silently mismatching object positions
  // (computed for one page size) against a canvas of a different size.
  const [showCaptions, setShowCaptions] = useState(true);

  const [size, setSize] = useState('A4');

  const [orientation, setOrientation] = useState('landscape');

  const [name, setName] = useState('New Certificate');

  const [customWidth, setCustomWidth] = useState(800);

  const [customHeight, setCustomHeight] = useState(800);

  // Refs mirroring the page-settings state above, updated SYNCHRONOUSLY
  // inside the setters below (unlike a useEffect mirror, which would only
  // catch up on the next render/commit — too late for code that calls
  // setSize/setOrientation and then immediately snapshots history in the
  // same synchronous block, e.g. right after loading a design or
  // template). saveHistory/resetHistory/loadCanvasState read from these
  // refs instead of the state variables directly, so a snapshot always
  // reflects the page settings as they are RIGHT NOW.
  const sizeRef = useRef(size);
  const orientationRef = useRef(orientation);
  const customWidthRef = useRef(customWidth);
  const customHeightRef = useRef(customHeight);

  const updateSize = useCallback((value) => {
    sizeRef.current = value;
    setSize(value);
  }, []);
  const updateOrientation = useCallback((value) => {
    orientationRef.current = value;
    setOrientation(value);
  }, []);
  const updateCustomWidth = useCallback((value) => {
    customWidthRef.current = value;
    setCustomWidth(value);
  }, []);
  const updateCustomHeight = useCallback((value) => {
    customHeightRef.current = value;
    setCustomHeight(value);
  }, []);

  // Re-apply the page size/orientation captured in a history snapshot.
  // Called AFTER canvasEditor.loadFromJSON() has already restored the
  // objects (with left/top/scale that are only valid for the page size
  // that was active at snapshot time). This just resizes the canvas to
  // match — clearPageSizeTracking() first ensures applyPageSettings()
  // takes the "first call" branch (set dimensions only) instead of trying
  // to re-scale/re-position objects that already have the correct
  // absolute coordinates baked in from the JSON.
  const restorePageSettings = useCallback(
    (canvas, snapshot) => {
      if (!canvas || !snapshot) return;

      const {
        size: snapSize,
        orientation: snapOrientation,
        customWidth: snapCustomWidth,
        customHeight: snapCustomHeight,
      } = snapshot;

      if (snapSize === undefined) return; // legacy snapshot, nothing to restore

      updateSize(snapSize);
      updateOrientation(snapOrientation);
      if (snapSize === 'custom') {
        updateCustomWidth(snapCustomWidth);
        updateCustomHeight(snapCustomHeight);
      }

      clearPageSizeTracking(canvas);

      const customDimensions =
        snapSize === 'custom'
          ? { width: snapCustomWidth, height: snapCustomHeight }
          : null;

      applyPageSettings(canvas, snapSize, snapOrientation, customDimensions);
      fitCanvasToContainer(canvas);
    },
    [updateSize, updateOrientation, updateCustomWidth, updateCustomHeight]
  );

  // --------------------------------------------------
  // UPDATE UNDO STACK
  // --------------------------------------------------
  const updateUndoStack = useCallback((newStack) => {
    undoStackRef.current = newStack;
    setUndoStack(newStack);
  }, []);

  // --------------------------------------------------
  // UPDATE REDO STACK
  // --------------------------------------------------
  const updateRedoStack = useCallback((newStack) => {
    redoStackRef.current = newStack;
    setRedoStack(newStack);
  }, []);

  // --------------------------------------------------
  // UNDO
  // --------------------------------------------------
  const undo = useCallback(async () => {
    if (!canvasEditor) return;

    // Don't allow another Undo while one is already running
    if (historyOperationInProgress.current) {
      console.log('UNDO IGNORED - OPERATION IN PROGRESS');
      return;
    }

    const currentUndoStack = undoStackRef.current;

    if (currentUndoStack.length <= 1) {
      console.log('NOTHING TO UNDO');
      return;
    }

    const currentState = currentUndoStack[currentUndoStack.length - 1];

    const previousState = currentUndoStack[currentUndoStack.length - 2];

    console.log('==============================');
    console.log('UNDO');
    console.log('Undo stack BEFORE:', currentUndoStack.length);

    historyOperationInProgress.current = true;
    isRestoring.current = true;

    try {
      // Remove current state from Undo
      const newUndoStack = currentUndoStack.slice(0, -1);

      // Put current state into Redo
      const newRedoStack = [...redoStackRef.current, currentState];

      updateUndoStack(newUndoStack);
      updateRedoStack(newRedoStack);

      // Restore the PREVIOUS complete canvas state
      await canvasEditor.loadFromJSON(previousState.canvasState);

      canvasEditor.requestRenderAll();

      // Restore the page size/orientation that were active for this
      // snapshot — the objects just loaded only make sense at that size.
      restorePageSettings(canvasEditor, previousState);

      console.log('Undo stack AFTER:', newUndoStack.length);
      console.log('UNDO COMPLETE');
      console.log('==============================');
    } catch (error) {
      console.error('Undo failed:', error);
    } finally {
      // Wait until Fabric has finished firing restoration events
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });

      isRestoring.current = false;
      historyOperationInProgress.current = false;
    }
  }, [canvasEditor, updateUndoStack, updateRedoStack, restorePageSettings]);

  // --------------------------------------------------
  // REDO
  // --------------------------------------------------
  const redo = useCallback(async () => {
    if (!canvasEditor) return;

    // Don't allow another operation while one is running
    if (historyOperationInProgress.current) {
      console.log('REDO IGNORED - OPERATION IN PROGRESS');
      return;
    }

    const currentRedoStack = redoStackRef.current;

    if (currentRedoStack.length === 0) {
      console.log('NOTHING TO REDO');
      return;
    }

    const nextState = currentRedoStack[currentRedoStack.length - 1];

    console.log('==============================');
    console.log('REDO');
    console.log('Redo stack BEFORE:', currentRedoStack.length);

    historyOperationInProgress.current = true;
    isRestoring.current = true;

    try {
      const newRedoStack = currentRedoStack.slice(0, -1);

      const newUndoStack = [...undoStackRef.current, nextState];

      updateUndoStack(newUndoStack);
      updateRedoStack(newRedoStack);

      await canvasEditor.loadFromJSON(nextState.canvasState);

      canvasEditor.requestRenderAll();

      // Restore the page size/orientation that were active for this
      // snapshot — the objects just loaded only make sense at that size.
      restorePageSettings(canvasEditor, nextState);

      console.log('Redo stack AFTER:', newRedoStack.length);
      console.log('REDO COMPLETE');
      console.log('==============================');
    } catch (error) {
      console.error('Redo failed:', error);
    } finally {
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });

      isRestoring.current = false;
      historyOperationInProgress.current = false;
    }
  }, [canvasEditor, updateUndoStack, updateRedoStack, restorePageSettings]);

  // --------------------------------------------------
  // SAVE HISTORY
  // --------------------------------------------------
  const saveHistory = useCallback(
    (canvas) => {
      if (!canvas) return;

      // Never save while restoring
      if (isRestoring.current) {
        console.log('HISTORY BLOCKED - RESTORING CANVAS');
        return;
      }

      // Snapshot bundles the Fabric objects together with the page
      // size/orientation that were active when they were captured — both
      // are needed to correctly restore this moment on Undo/Redo.
      const snapshot = {
        canvasState: canvas.toJSON(),
        size: sizeRef.current,
        orientation: orientationRef.current,
        customWidth: customWidthRef.current,
        customHeight: customHeightRef.current,
      };

      const currentUndoStack = undoStackRef.current;

      const lastSnapshot = currentUndoStack[currentUndoStack.length - 1];

      // Prevent identical consecutive states
      if (
        lastSnapshot &&
        JSON.stringify(lastSnapshot) === JSON.stringify(snapshot)
      ) {
        console.log('DUPLICATE HISTORY - NOT SAVED');
        return;
      }

      const newUndoStack = [...currentUndoStack, snapshot];

      console.log('HISTORY SAVED');
      console.log('Undo stack length:', newUndoStack.length);

      updateUndoStack(newUndoStack);

      // Any new user action clears Redo
      updateRedoStack([]);
    },
    [updateUndoStack, updateRedoStack]
  );

  // --------------------------------------------------
  // RUN WITHOUT HISTORY
  // --------------------------------------------------
  const runWithoutHistory = useCallback(async (callback) => {
    isRestoring.current = true;

    try {
      await callback();
    } finally {
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });

      isRestoring.current = false;
    }
  }, []);

  // --------------------------------------------------
  // LOAD SAVED CANVAS STATE
  // --------------------------------------------------
  const loadCanvasState = useCallback(
    async (canvas, state) => {
      if (!canvas || !state) return;

      isRestoring.current = true;

      try {
        await canvas.loadFromJSON(state.canvasState ?? state);

        canvas.requestRenderAll();

        restorePageSettings(canvas, state);

        // restorePageSettings updates sizeRef/orientationRef/etc.
        // synchronously above, so these reads are always current.
        const initialSnapshot = {
          canvasState: canvas.toJSON(),
          size: sizeRef.current,
          orientation: orientationRef.current,
          customWidth: customWidthRef.current,
          customHeight: customHeightRef.current,
        };

        updateUndoStack([initialSnapshot]);
        updateRedoStack([]);
      } catch (error) {
        console.error('Error loading canvas state:', error);
      } finally {
        await new Promise((resolve) => {
          requestAnimationFrame(resolve);
        });

        isRestoring.current = false;
      }
    },
    [restorePageSettings, updateUndoStack, updateRedoStack]
  );

  // --------------------------------------------------
  // RESET HISTORY
  // --------------------------------------------------
  // Called after the caller has already applied the desired page size/
  // orientation to the canvas (e.g. via applyPageSettings, possibly
  // together with setSize/setOrientation). Reads sizeRef/orientationRef
  // (synchronously up to date, see above) rather than the size/orientation
  // state variables, since resetHistory often runs in the same
  // synchronous block as those setter calls, before React has re-rendered.
  const resetHistory = useCallback(
    (canvas) => {
      if (!canvas) return;

      const snapshot = {
        canvasState: canvas.toJSON(),
        size: sizeRef.current,
        orientation: orientationRef.current,
        customWidth: customWidthRef.current,
        customHeight: customHeightRef.current,
      };

      console.log('HISTORY RESET');

      updateUndoStack([snapshot]);
      updateRedoStack([]);
    },
    [updateUndoStack, updateRedoStack]
  );

  // --------------------------------------------------
  // CYPRESS TEST SUPPORT
  // --------------------------------------------------
  useEffect(() => {
    if (window.Cypress && canvasEditor) {
      window.canvasEditor = canvasEditor;
    }
  }, [canvasEditor]);

  // --------------------------------------------------
  // CONTEXT
  // --------------------------------------------------
  return (
    <CanvasContext
      value={{
        canvasEditor,
        setCanvasEditor,

        saveHistory,
        loadCanvasState,
        resetHistory,
        runWithoutHistory,

        undo,
        redo,

        undoStack,
        redoStack,

        isHistoryRestoring,

        showCaptions,
        setShowCaptions,

        size,
        setSize: updateSize,

        orientation,
        setOrientation: updateOrientation,

        name,
        setName,

        customWidth,
        setCustomWidth: updateCustomWidth,

        customHeight,
        setCustomHeight: updateCustomHeight,
      }}
    >
      {children}
    </CanvasContext>
  );
};
