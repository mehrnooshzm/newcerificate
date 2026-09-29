// Connect the alignment feature.

import { getCanvasCandidates, getObjectCandidates } from './snapCandidates';
import { getClosestSnap, applySnap } from './snapUtils';
import { clearGuides, showGuide } from './guideUtils';

const DEFAULT_OPTIONS = {
  snappingThreshold: 8,
  releaseThreshold: 12,
  guideColor: '#9558ff',
  guideWidth: 1,
  guideDash: [5, 5],
  guideOpacity: 0.8,
};

const isSameSnap = (snapA, snapB) => {
  if (!snapA && !snapB) {
    return true;
  }

  if (!snapA || !snapB) {
    return false;
  }

  return (
    snapA.axis === snapB.axis &&
    snapA.movingPoint === snapB.movingPoint &&
    snapA.targetPoint === snapB.targetPoint &&
    snapA.position === snapB.position &&
    snapA.target === snapB.target
  );
};

export const initAlignmentGuides = (canvas, options = {}) => {
  if (!canvas) {
    return () => {};
  }
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  config.releaseThreshold = Math.max(
    config.releaseThreshold,
    config.snappingThreshold + 2
  );

  let activeSnap = {
    x: null,
    y: null,
  };

  let previousSnapX = null;
  let previousSnapY = null;

  //Captured when dragging starts.
  let dragStart = null;

  const resetSnapping = () => {
    activeSnap = {
      x: null,
      y: null,
    };

    previousSnapX = null;
    previousSnapY = null;
  };

  //Start tracking the pointer and object's original position
  const handleMouseDown = ({ target, e }) => {
    if (!target) {
      return;
    }
    const pointer = canvas.getScenePoint(e);
    dragStart = {
      target,
      pointerX: pointer.x,
      pointerY: pointer.y,
      left: target.left ?? 0,
      top: target.top ?? 0,
    };
    resetSnapping();
  };

  //Handle object movement
  const handleObjectMoving = ({ target, e }) => {
    if (!target) {
      return;
    }
    if (!dragStart || dragStart.target !== target) {
      return;
    }
    const pointer = canvas.getScenePoint(e);
    const deltaX = pointer.x - dragStart.pointerX;
    const deltaY = pointer.y - dragStart.pointerY;
    const baseLeft = dragStart.left + deltaX;
    const baseTop = dragStart.top + deltaY;

    //Lets getBounds() calculate the correct alignment candidates
    target.set({
      left: baseLeft,
      top: baseTop,
    });

    target.setCoords();

    //Find possible snapping positions
    const canvasCandidates = getCanvasCandidates(canvas, target);
    const objectCandidates = getObjectCandidates(canvas, target);
    const candidates = [...canvasCandidates, ...objectCandidates];

    const snapX = getClosestSnap(target, candidates, 'x', activeSnap, config);
    const snapY = getClosestSnap(target, candidates, 'y', activeSnap, config);

    //Apply the snap to the pointer-derived position
    const snappedPosition = applySnap(
      baseLeft,
      baseTop,
      snapX,
      snapY,
      activeSnap
    );
    target.set({
      left: snappedPosition.left,
      top: snappedPosition.top,
    });
    target.setCoords();
    const snapChanged =
      !isSameSnap(previousSnapX, snapX) || !isSameSnap(previousSnapY, snapY);

    if (snapChanged) {
      clearGuides(canvas);

      if (snapX) {
        showGuide(canvas, snapX, config);
      }
      if (snapY) {
        showGuide(canvas, snapY, config);
      }
      previousSnapX = snapX;
      previousSnapY = snapY;
    }
    canvas.requestRenderAll();
  };

  const handleObjectModified = () => {
    clearGuides(canvas);
    resetSnapping();
    dragStart = null;
    canvas.requestRenderAll();
  };

  const handleSelectionCleared = () => {
    clearGuides(canvas);
    resetSnapping();
    dragStart = null;
    canvas.requestRenderAll();
  };

  const handleSelectionCreated = () => {
    clearGuides(canvas);
    resetSnapping();
    dragStart = null;
    canvas.requestRenderAll();
  };

  // Start tracking the drag
  canvas.on('mouse:down', handleMouseDown);
  
  //Apply snapping while dragging
  canvas.on('object:moving', handleObjectMoving);
  canvas.on('object:modified', handleObjectModified);
  canvas.on('selection:cleared', handleSelectionCleared);
  canvas.on('selection:created', handleSelectionCreated);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('object:moving', handleObjectMoving);
    canvas.off('object:modified', handleObjectModified);
    canvas.off('selection:cleared', handleSelectionCleared);
    canvas.off('selection:created', handleSelectionCreated);
    clearGuides(canvas);
    resetSnapping();
    dragStart = null;
    canvas.requestRenderAll();
  };
};
