import {
  applyPageSettings,
  clearPageSizeTracking,
  fitCanvasToContainer,
  resetPageSizeBaseline,
} from '@/utils/canvasSettings';
import { DEFAULT_PREVIEW_IMAGE } from '@/constants/imagePlaceholders';

const finishCanvasLoad = (canvasEditor) => {
  canvasEditor.requestRenderAll();

  canvasEditor.getObjects().forEach((obj) => {
    obj.set('dirty', true);
  });

  canvasEditor.requestRenderAll();
  fitCanvasToContainer(canvasEditor);
};

const customDimensionsFrom = (source) =>
  source.size === 'custom'
    ? {
        width: Number(source.customWidth),
        height: Number(source.customHeight),
      }
    : null;

// Checks whether an image URL actually loads.
// Resolves true/false — never rejects, so it's safe
// to use in Promise.all.
const checkImageExists = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(false);

    const img = new Image();

    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);

    img.src = src;
  });

// Deep-clones canvasData and swaps any broken image
// src values for the placeholder BEFORE handing it
// to Fabric.
const sanitizeCanvasData = async (canvasData) => {
  const clone = JSON.parse(JSON.stringify(canvasData));

  const objects = clone.objects || [];

  await Promise.all(
    objects.map(async (obj) => {
      const isImage = obj.type?.toLowerCase() === 'image';

      if (!isImage || !obj.src) return;

      const exists = await checkImageExists(obj.src);

      if (!exists) {
        obj.src = DEFAULT_PREVIEW_IMAGE;
      }
    })
  );

  return clone;
};

export const loadTemplateIntoCanvas = async (
  canvasEditor,
  setSize,
  setOrientation,
  template,
  setName,
  setCustomWidth,
  setCustomHeight
) => {
  // Validate/replace broken image URLs first,
  // so one missing image can't silently blank
  // the entire canvas render.
  const safeCanvasData = await sanitizeCanvasData(template.canvasData);

  // Apply the saved page settings BEFORE restoring
  // objects so their coordinates use the same
  // dimensions as when the template was created.
  if (template.size && template.orientation && template.name) {
    const templateCustomDims = customDimensionsFrom(template);

    setSize(template.size);
    setName(template.name);
    setOrientation(template.orientation);
    if (template.size === 'custom' && templateCustomDims) {
      setCustomWidth?.(templateCustomDims.width);
      setCustomHeight?.(templateCustomDims.height);
    }

    clearPageSizeTracking(canvasEditor);

    applyPageSettings(
      canvasEditor,
      template.size,
      template.orientation,
      templateCustomDims
    );
  }

  // Load the canvas objects from the sanitized
  // template JSON.
  await canvasEditor.loadFromJSON(safeCanvasData);

  resetPageSizeBaseline(canvasEditor, customDimensionsFrom(template));

  finishCanvasLoad(canvasEditor);
};

export const loadDesignIntoCanvas = async (
  canvasEditor,
  design,
  setSize,
  setOrientation,
  setCustomWidth,
  setCustomHeight
) => {
  if (!canvasEditor || !design?.canvasData) {
    return;
  }

  const size = design.size || 'A4';
  const orientation = design.orientation || 'landscape';
  const customDims = customDimensionsFrom(design);

  // Sync the page size/orientation into React state too, not just onto
  // the canvas — otherwise the toolbox UI keeps showing stale defaults,
  // and (more importantly) any history snapshot taken right after this
  // load would capture the wrong size/orientation, since it reads from
  // this state rather than from the canvas's internal bookkeeping.
  setSize?.(size);
  setOrientation?.(orientation);
  if (size === 'custom' && customDims) {
    setCustomWidth?.(customDims.width);
    setCustomHeight?.(customDims.height);
  }

  // Forget any page size left over from
  // /designs/new so this load is a clean baseline.
  clearPageSizeTracking(canvasEditor);

  applyPageSettings(canvasEditor, size, orientation, customDims);

  await canvasEditor.loadFromJSON(design.canvasData);

  resetPageSizeBaseline(canvasEditor, customDims);

  finishCanvasLoad(canvasEditor);
};
