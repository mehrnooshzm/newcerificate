// Draw the visual dashed alignment lines.

import { Polyline } from 'fabric';

const GUIDE_PREFIX = 'alignment-guide-';

//Remove all alignment guides
export const clearGuides = (canvas) => {
  if (!canvas) {
    return;
  }
  const guides = canvas
    .getObjects()
    .filter((object) => object.id?.startsWith(GUIDE_PREFIX));

  guides.forEach((guide) => {
    canvas.remove(guide);
  });
};

//Draw one alignment guide
export const showGuide = (canvas, snap, options = {}) => {
  if (!canvas || !snap) {
    return;
  }

  const {
    guideColor = '#9558ff',
    guideWidth = 1,
    guideDash = [5, 5],
    guideOpacity = 0.8,
  } = options;

  const isVertical = snap.axis === 'x';

  const guideId = `${GUIDE_PREFIX}${snap.axis}-${snap.type}`;
  const existingGuide = canvas
    .getObjects()
    .find((object) => object.id === guideId);

  if (existingGuide) {
    return;
  }
  const points = isVertical
    ? [
        {x: 0, y: 0},
        {
          x: 0,
          y: canvas.height,
        },
      ]
    : [
        {x: 0, y: 0},
        {
          x: canvas.width,
          y: 0,
        },
      ];

  const guide = new Polyline(points, {
    id: guideId,
    stroke: guideColor,
    strokeWidth: guideWidth,
    strokeDashArray: guideDash,
    opacity: guideOpacity,
    fill: '',
    selectable: false,
    evented: false,
    excludeFromExport: true,
    originX: 'left',
    originY: 'top',
  });

  guide.set({
    left: isVertical ? snap.position : 0,
    top: isVertical ? 0 : snap.position,
  });
  guide.setCoords();
  canvas.add(guide);
};
