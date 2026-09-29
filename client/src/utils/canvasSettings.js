// Predefined page sizes in pixels for common formats
export const pageSizes = {
  A4: {
    portrait: { width: 595, height: 842 },
    landscape: { width: 842, height: 595 },
  },
  letter: {
    portrait: { width: 612, height: 792 },
    landscape: { width: 792, height: 612 },
  },
  // "custom" has no fixed dimensions — they come from user input at runtime
};

const sizeKey = (width, height) => `${width}x${height}`;

// How much of an object's own area must sit OUTSIDE the canonical page
// before it's treated as decorative/bleed and excluded from the
// overflow-shrink calculation. 0.5 = "more than half of it is off-page".
// Tune this if legitimate content objects start getting excluded, or if
// mild bleed elements still blow up the shrink factor.
const BLEED_OUTSIDE_RATIO_THRESHOLD = 0.5;

// Apply page size and orientation settings to a Fabric.js canvas
// customDimensions = { width, height } — required only when pageSize === 'custom'
export function applyPageSettings(
  canvas,
  pageSize,
  orientation,
  customDimensions = null
) {
  if (!canvas || canvas.disposed) return;

  let width, height;

  if (pageSize === 'custom') {
    if (!customDimensions?.width || !customDimensions?.height) {
      console.warn(
        'applyPageSettings: custom size requires customDimensions { width, height }'
      );
      return;
    }
    ({ width, height } = customDimensions);
  } else {
    if (!pageSizes[pageSize] || !pageSizes[pageSize][orientation]) return;
    ({ width, height } = pageSizes[pageSize][orientation]);
  }

  // Capture the canonical (original) page size ONCE — every future scale is
  // computed relative to this, never relative to the last page size. This is
  // what prevents compounding shrink on repeated orientation toggles.
  if (!canvas._canonicalWidth || !canvas._canonicalHeight) {
    canvas._canonicalWidth = canvas._pageWidth || width;
    canvas._canonicalHeight = canvas._pageHeight || height;
  }

  if (canvas._pageWidth && canvas._pageHeight) {
    scaleCanvasContent(canvas, width, height);
  }

  canvas._pageWidth = width;
  canvas._pageHeight = height;

  canvas.setWidth(width);
  canvas.setHeight(height);
  canvas.setZoom(1);
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.calcOffset();
  canvas.renderAll();
}

// Compute an object's axis-aligned footprint (x, y, width, height) given a
// scale/offset to apply to its CANONICAL transform (_origLeft/_origTop/
// _origScaleX/_origScaleY), accounting for non-default origins. Shared by
// the overflow bbox calculation and the automatic bleed-detection check
// below, so both agree on what "where this object sits" means.
function getObjectFootprint(obj, scale, offsetX, offsetY) {
  const scaleX = obj._origScaleX * scale;
  const scaleY = obj._origScaleY * scale;
  const left = obj._origLeft * scale + offsetX;
  const top = obj._origTop * scale + offsetY;
  const width = (obj.width || 0) * scaleX;
  const height = (obj.height || 0) * scaleY;

  let x = left;
  let y = top;
  if (obj.originX === 'center') x -= width / 2;
  else if (obj.originX === 'right') x -= width;
  if (obj.originY === 'center') y -= height / 2;
  else if (obj.originY === 'bottom') y -= height;

  return { x, y, width, height };
}

// Automatically decide whether an object is a decorative/bleed element that
// should never be allowed to drag the whole design's overflow-shrink factor
// down — e.g. a big background circle that's intentionally positioned
// mostly off the page. Decision is based on how much of the object's OWN
// area falls outside the CANONICAL page (scale=1, offset=0), i.e. "was this
// already mostly off-page as originally authored?" This is computed fresh
// each time (cheap) so it always reflects the object's current canonical
// footprint, including ones added mid-session.
function isBleedElement(obj, canonicalWidth, canonicalHeight) {
  const { x, y, width, height } = getObjectFootprint(obj, 1, 0, 0);
  if (width <= 0 || height <= 0) return false;

  const objArea = width * height;

  const overlapLeft = Math.max(x, 0);
  const overlapTop = Math.max(y, 0);
  const overlapRight = Math.min(x + width, canonicalWidth);
  const overlapBottom = Math.min(y + height, canonicalHeight);

  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
  const overlapHeight = Math.max(0, overlapBottom - overlapTop);
  const overlapArea = overlapWidth * overlapHeight;

  const outsideRatio = 1 - overlapArea / objArea;
  return outsideRatio >= BLEED_OUTSIDE_RATIO_THRESHOLD;
}

// Scale + re-position every object for a target page size (newWidth x
// newHeight). Two layers, in priority order:
//
//   1. EXACT-REPLAY CACHE (per object, per exact page size): every time an
//      object's layout is computed for a given page size, it's stashed on
//      the object itself. The next time that EXACT page size comes back
//      around, every object with a cached entry for it is restored
//      byte-for-byte instead of recomputed, so Landscape -> Portrait ->
//      Landscape always lands back on the exact same layout.
//
//   2. CANONICAL SCALE FORMULA (fallback): uniform scale relative to the
//      canonical page, then shrinks further only if needed so nothing
//      overflows the new page (never upscales). Objects that are
//      automatically detected as decorative/bleed (see isBleedElement)
//      are excluded from the overflow check itself — otherwise a single
//      big background shape that's meant to sit mostly off-page can force
//      the ENTIRE design (text, photos, everything) to shrink far more
//      than necessary just to make room for a shape that was never meant
//      to fit inside the page anyway. Bleed objects still get positioned
//      by the same formula afterwards, just don't influence how small
//      that formula makes everything.
function scaleCanvasContent(canvas, newWidth, newHeight) {
  const objects = canvas.getObjects();
  const key = sizeKey(newWidth, newHeight);

  const currentScale = canvas._lastContentScale ?? 1;
  const currentOffsetX = canvas._lastContentOffsetX ?? 0;

  objects.forEach((obj) => {
    if (obj._origLeft === undefined) {
      obj._origLeft = (obj.left - currentOffsetX) / currentScale;
      obj._origTop = obj.top / currentScale; // offsetY is always 0
      obj._origScaleX = obj.scaleX / currentScale;
      obj._origScaleY = obj.scaleY / currentScale;
    }
  });

  const needsCompute = objects.some(
    (obj) => !obj._sizeSnapshots || !obj._sizeSnapshots[key]
  );

  let scale = canvas._sizeScaleByKey?.[key]?.scale;
  let offsetX = canvas._sizeScaleByKey?.[key]?.offsetX;
  const offsetY = 0;

  if (scale === undefined || needsCompute) {
    const uniformScale = Math.sqrt(
      (newWidth / canvas._canonicalWidth) *
        (newHeight / canvas._canonicalHeight)
    );

    const provisionalOffsetX =
      (newWidth - canvas._canonicalWidth * uniformScale) / 2;

    // Automatically split objects: only ones that were NOT already mostly
    // off-page at canonical scale get to influence the overflow check.
    const overflowRelevantObjects = objects.filter(
      (obj) =>
        !isBleedElement(obj, canvas._canonicalWidth, canvas._canonicalHeight)
    );

    const bbox = getObjectsBoundingBox(
      overflowRelevantObjects,
      uniformScale,
      provisionalOffsetX,
      0
    );

    let overflowScale = 1;
    if (bbox) {
      const bboxWidth = bbox.right - bbox.left;
      const bboxHeight = bbox.bottom - bbox.top;
      if (bboxWidth > newWidth || bboxHeight > newHeight) {
        overflowScale = Math.min(
          newWidth / bboxWidth,
          newHeight / bboxHeight,
          1
        );
      }
    }

    scale = uniformScale * overflowScale;
    offsetX = (newWidth - canvas._canonicalWidth * scale) / 2;

    if (!canvas._sizeScaleByKey) canvas._sizeScaleByKey = {};
    canvas._sizeScaleByKey[key] = { scale, offsetX };
  }

  objects.forEach((obj) => {
    const cached = obj._sizeSnapshots && obj._sizeSnapshots[key];

    if (cached) {
      obj.set({
        left: cached.left,
        top: cached.top,
        scaleX: cached.scaleX,
        scaleY: cached.scaleY,
      });
    } else {
      obj.set({
        left: obj._origLeft * scale + offsetX,
        top: obj._origTop * scale + offsetY,
        scaleX: obj._origScaleX * scale,
        scaleY: obj._origScaleY * scale,
      });
    }
    obj.setCoords();

    if (!obj._sizeSnapshots) obj._sizeSnapshots = {};
    obj._sizeSnapshots[key] = {
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
    };
  });

  canvas._lastContentScale = scale;
  canvas._lastContentOffsetX = offsetX;
}

// Compute the combined bounding box of a set of Fabric objects, using each
// object's CANONICAL (unscaled-baseline) transform multiplied by a given
// scale/offset. Returns null if there are no objects to measure.
function getObjectsBoundingBox(objects, scale, offsetX, offsetY) {
  if (!objects.length) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  objects.forEach((obj) => {
    const { x, y, width, height } = getObjectFootprint(
      obj,
      scale,
      offsetX,
      offsetY
    );

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return { left: minX, top: minY, right: maxX, bottom: maxY };
}

// Refresh ONE object's canonical baseline (_origLeft/_origTop/_origScaleX/
// _origScaleY) from its CURRENT on-canvas transform, and drop every cached
// _sizeSnapshots entry for it except the current page size.
//
// WHY THIS EXISTS: scaleCanvasContent() only ever computes _origLeft/_origTop/
// _origScaleX/_origScaleY the FIRST time it sees an object (guarded by
// `if (obj._origLeft === undefined)`). After that, those values are frozen
// forever — they are never updated just because the user dragged, resized,
// or rotated the object. So the next time applyPageSettings() runs (e.g. the
// user toggles Landscape/Portrait), the object's new position/scale for the
// new page size is computed from that STALE baseline, silently throwing away
// every manual edit made since the baseline was captured. Worse, if the
// target page size was visited before, the per-object `_sizeSnapshots` cache
// plays back the OLD (pre-edit) position byte-for-byte.
//
// Call this after every object:modified (move/scale/rotate) so the object's
// "canonical" transform always matches what's actually on the canvas right
// now. This is the same idea as resetPageSizeBaseline(), just scoped to a
// single object and safe to call continuously during editing (not just on
// save/load).
export function refreshObjectBaseline(canvas, obj) {
  if (!canvas || canvas.disposed || !obj) return;
  if (!canvas._pageWidth || !canvas._pageHeight) return;

  const currentScale = canvas._lastContentScale ?? 1;
  const currentOffsetX = canvas._lastContentOffsetX ?? 0;

  obj._origLeft = (obj.left - currentOffsetX) / currentScale;
  obj._origTop = obj.top / currentScale; // offsetY is always 0
  obj._origScaleX = obj.scaleX / currentScale;
  obj._origScaleY = obj.scaleY / currentScale;

  // Any snapshot cached for a DIFFERENT page size was computed from the old
  // baseline and is now wrong — drop it so the next visit to that size falls
  // through to the canonical scale formula (which now uses the fresh
  // baseline above) instead of replaying stale coordinates. Keep/refresh
  // only the entry for the page size the object is showing right now.
  const key = sizeKey(canvas._pageWidth, canvas._pageHeight);
  obj._sizeSnapshots = {
    [key]: {
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
    },
  };
}

// Treat the current page size and object transforms as the new original.
// Call after save or when loading a design so subsequent size/orientation
// changes scale from the saved layout, not from leftover /designs/new state.
export function resetPageSizeBaseline(canvas, dimensions = null) {
  if (!canvas || canvas.disposed) return;

  const width = dimensions?.width ?? canvas._pageWidth;
  const height = dimensions?.height ?? canvas._pageHeight;

  if (width) canvas._canonicalWidth = width;
  if (height) canvas._canonicalHeight = height;
  if (width) canvas._pageWidth = width;
  if (height) canvas._pageHeight = height;

  canvas._lastContentScale = 1;
  canvas._lastContentOffsetX = 0;

  const currentKey = width && height ? sizeKey(width, height) : null;
  canvas._sizeScaleByKey = currentKey
    ? { [currentKey]: { scale: 1, offsetX: 0 } }
    : {};

  canvas.getObjects().forEach((obj) => {
    obj._origLeft = obj.left;
    obj._origTop = obj.top;
    obj._origScaleX = obj.scaleX;
    obj._origScaleY = obj.scaleY;

    obj._sizeSnapshots = currentKey
      ? {
          [currentKey]: {
            left: obj.left,
            top: obj.top,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
          },
        }
      : {};
  });
}

// Drop leftover page-size tracking before loading saved JSON, so
// applyPageSettings does not scale objects from a previous session.
export function clearPageSizeTracking(canvas) {
  if (!canvas || canvas.disposed) return;

  delete canvas._canonicalWidth;
  delete canvas._canonicalHeight;
  delete canvas._pageWidth;
  delete canvas._pageHeight;
  delete canvas._lastContentScale;
  delete canvas._lastContentOffsetX;
  delete canvas._sizeScaleByKey;

  canvas.getObjects().forEach((obj) => {
    delete obj._origLeft;
    delete obj._origTop;
    delete obj._origScaleX;
    delete obj._origScaleY;
    delete obj._sizeSnapshots;
  });
}

// Scale the canvas so it fits within its parent container's current
// dimensions — used to keep the editor canvas responsive on mobile/tablet
// viewports and whenever the window is resized.
export function fitCanvasToContainer(canvas) {
  if (!canvas || canvas.disposed) return;

  const container = canvas.wrapperEl?.parentNode;
  if (!container) return;

  if (!canvas._pageWidth || !canvas._pageHeight) return;

  const pageWidth = canvas._pageWidth;
  const pageHeight = canvas._pageHeight;

  if (!container.clientWidth || !container.clientHeight) return;

  const scale = Math.min(
    container.clientWidth / pageWidth,
    container.clientHeight / pageHeight,
    1
  );

  if (!scale || !isFinite(scale)) return;

  canvas.setDimensions({
    width: pageWidth * scale,
    height: pageHeight * scale,
  });
  canvas.setZoom(scale);
  canvas.calcOffset();
  canvas.renderAll();
}
