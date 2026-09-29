// Find all the places where the moving object could align.

const GUIDE_PREFIX = 'alignment-guide-';

//Get the object's bounds in Fabric's scene/canvas coordinate system
export const getBounds = (object) => {
  if (!object) {
    return null;
  }
  const coords = object.getCoords();
  if (!coords || coords.length === 0) {
    return null;
  }

  const xs = coords.map((point) => point.x);
  const ys = coords.map((point) => point.y);

  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);

  return {
    left,
    right,
    top,
    bottom,

    width: right - left,
    height: bottom - top,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  };
};

//Get the possible alignment points.
export const getPoints = (bounds) => ({
  x: [
    {
      type: 'left',
      value: bounds.left,
    },

    {
      type: 'center',
      value: bounds.centerX,
    },

    {
      type: 'right',
      value: bounds.right,
    },
  ],

  y: [
    {
      type: 'top',
      value: bounds.top,
    },

    {
      type: 'center',
      value: bounds.centerY,
    },

    {
      type: 'bottom',
      value: bounds.bottom,
    },
  ],
});

//Generate alignment candidates.
const createXAxisCandidates = (
  movingPoints,
  targetPoints,
  target,
  typePrefix
) => {
  const movingLeft = movingPoints.find((point) => point.type === 'left');
  const movingCenter = movingPoints.find((point) => point.type === 'center');
  const movingRight = movingPoints.find((point) => point.type === 'right');
  const targetLeft = targetPoints.find((point) => point.type === 'left');
  const targetCenter = targetPoints.find((point) => point.type === 'center');
  const targetRight = targetPoints.find((point) => point.type === 'right');

  return [
    {
      axis: 'x',
      movingPoint: 'left',
      targetPoint: 'left',
      position: targetLeft.value,
      offset: targetLeft.value - movingLeft.value,
      target,
      distance: Math.abs(movingLeft.value - targetLeft.value),
      type: `${typePrefix}-left-left`,
    },

    {
      axis: 'x',
      movingPoint: 'center',
      targetPoint: 'center',
      position: targetCenter.value,
      offset: targetCenter.value - movingCenter.value,
      target,
      distance: Math.abs(movingCenter.value - targetCenter.value),
      type: `${typePrefix}-center-center`,
    },

    {
      axis: 'x',
      movingPoint: 'right',
      targetPoint: 'right',
      position: targetRight.value,
      offset: targetRight.value - movingRight.value,
      target,
      distance: Math.abs(movingRight.value - targetRight.value),
      type: `${typePrefix}-right-right`,
    },

    {
      axis: 'x',
      movingPoint: 'left',
      targetPoint: 'right',
      position: targetRight.value,
      offset: targetRight.value - movingLeft.value,
      target,
      distance: Math.abs(movingLeft.value - targetRight.value),
      type: `${typePrefix}-left-right`,
    },

    {
      axis: 'x',
      movingPoint: 'right',
      targetPoint: 'left',
      position: targetLeft.value,
      offset: targetLeft.value - movingRight.value,
      target,
      distance: Math.abs(movingRight.value - targetLeft.value),
      type: `${typePrefix}-right-left`,
    },
  ];
};

const createYAxisCandidates = (
  movingPoints,
  targetPoints,
  target,
  typePrefix
) => {
  const movingTop = movingPoints.find((point) => point.type === 'top');
  const movingCenter = movingPoints.find((point) => point.type === 'center');
  const movingBottom = movingPoints.find((point) => point.type === 'bottom');
  const targetTop = targetPoints.find((point) => point.type === 'top');
  const targetCenter = targetPoints.find((point) => point.type === 'center');
  const targetBottom = targetPoints.find((point) => point.type === 'bottom');

  return [
    {
      axis: 'y',
      movingPoint: 'top',
      targetPoint: 'top',
      position: targetTop.value,
      offset: targetTop.value - movingTop.value,
      target,
      distance: Math.abs(movingTop.value - targetTop.value),
      type: `${typePrefix}-top-top`,
    },

    {
      axis: 'y',
      movingPoint: 'center',
      targetPoint: 'center',
      position: targetCenter.value,
      offset: targetCenter.value - movingCenter.value,
      target,
      distance: Math.abs(movingCenter.value - targetCenter.value),
      type: `${typePrefix}-center-center`,
    },

    {
      axis: 'y',
      movingPoint: 'bottom',
      targetPoint: 'bottom',
      position: targetBottom.value,
      offset: targetBottom.value - movingBottom.value,
      target,
      distance: Math.abs(movingBottom.value - targetBottom.value),
      type: `${typePrefix}-bottom-bottom`,
    },

    {
      axis: 'y',
      movingPoint: 'top',
      targetPoint: 'bottom',
      position: targetBottom.value,
      offset: targetBottom.value - movingTop.value,
      target,
      distance: Math.abs(movingTop.value - targetBottom.value),
      type: `${typePrefix}-top-bottom`,
    },

    {
      axis: 'y',
      movingPoint: 'bottom',
      targetPoint: 'top',
      position: targetTop.value,
      offset: targetTop.value - movingBottom.value,
      target,
      distance: Math.abs(movingBottom.value - targetTop.value),
      type: `${typePrefix}-bottom-top`,
    },
  ];
};

export const getCanvasCandidates = (canvas, object) => {
  const bounds = getBounds(object);

  if (!bounds) {
    return [];
  }

  const points = getPoints(bounds);
  const canvasX = [
    {
      type: 'left',
      value: 0,
    },
    {
      type: 'center',
      value: canvas.width / 2,
    },
    {
      type: 'right',
      value: canvas.width,
    },
  ];

  const canvasY = [
    {
      type: 'top',
      value: 0,
    },
    {
      type: 'center',
      value: canvas.height / 2,
    },
    {
      type: 'bottom',
      value: canvas.height,
    },
  ];

  return [
    ...createXAxisCandidates(points.x, canvasX, null, 'canvas'),
    ...createYAxisCandidates(points.y, canvasY, null, 'canvas'),
  ];
};

export const getObjectCandidates = (canvas, movingObject) => {
  const movingBounds = getBounds(movingObject);

  if (!movingBounds) {
    return [];
  }
  const movingPoints = getPoints(movingBounds);
  const targets = canvas
    .getObjects()
    .filter((object) => isValidTarget(object, movingObject));
  return targets.flatMap((target) => {
    const targetBounds = getBounds(target);
    if (!targetBounds) {
      return [];
    }
    const targetPoints = getPoints(targetBounds);
    return [
      ...createXAxisCandidates(
        movingPoints.x,
        targetPoints.x,
        target,
        'object'
      ),
      ...createYAxisCandidates(
        movingPoints.y,
        targetPoints.y,
        target,
        'object'
      ),
    ];
  });
};

const isValidTarget = (target, movingObject) => {
  if (!target) {
    return false;
  }
  // Do not snap to itself.
  if (target === movingObject) {
    return false;
  }
  // Do not snap to alignment guides.
  if (target.id?.startsWith(GUIDE_PREFIX)) {
    return false;
  }
  // Ignore invisible objects.
  if (target.visible === false) {
    return false;
  }
  // Ignore transparent objects.
  if (target.opacity === 0) {
    return false;
  }
  //Do not snap an ActiveSelection to one of its own objects.
  if (
    movingObject.type === 'activeSelection' &&
    typeof movingObject.getObjects === 'function' &&
    movingObject.getObjects().includes(target)
  ) {
    return false;
  }
  return true;
};
