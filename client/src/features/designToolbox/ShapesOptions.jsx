import { Circle, Rect, Triangle } from 'fabric';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { shapesOptions } from '@/constants/shapesOptions';

const ShapesOptions = () => {
  const { canvasEditor } = useCanvasContext();
  // Handle adding shape to canvas
  const handleShapeClick = (shapeName) => {
    if (!canvasEditor) return;

    // width/height/left/top/radius below are defined in the canvas's
    // CANONICAL coordinate space (same space applyPageSettings scales
    // everything else from). If the page is currently showing at a scale
    // other than 1 (e.g. after switching orientation/page size), we must
    // apply that same scale here too — otherwise the new shape is drawn
    // at its raw canonical size while everything else on the page is
    // scaled, so it looks wrong now AND gets mis-scaled on every
    // subsequent size/orientation change (its baseline would be computed
    // by dividing by the current scale, inflating it further each time).
    const scale = canvasEditor._lastContentScale ?? 1;
    const offsetX = canvasEditor._lastContentOffsetX ?? 0;

    // Default properties for all shapes
    const properties = {
      width: 100,
      height: 100,
      top: 100 * scale,
      left: 100 * scale + offsetX,
      radius: 50,
      scaleX: scale,
      scaleY: scale,
      fill: '#000000',
      stroke: '#000000',
      strokeWidth: 0,
    };

    let shapeRef;
    // Create shape instance based on selected type
    switch (shapeName) {
      case 'Circle':
        shapeRef = new Circle({ ...properties });
        break;
      case 'Square':
        shapeRef = new Rect({ ...properties });
        break;
      case 'Triangle':
        shapeRef = new Triangle({ ...properties });
        break;
      default:
        break;
    }
    // Add shape to canvas and render. (CanvasEditor's object:added
    // listener takes care of registering this shape's canonical baseline.)
    canvasEditor.add(shapeRef);
    canvasEditor.renderAll();
  };

  return (
    <div className='flex justify-center items-center gap-5'>
      {/* Render shape buttons */}
      {shapesOptions.map(({ name, icon: Icon }) => (
        <button
          key={name}
          type='button'
          data-cy={`shape-${name.toLowerCase()}`}
          aria-label={`Add ${name}`}
          className='flex justify-center items-center p-2 rounded-xl border border-[#dfdfdf] hover:scale-125 transition-all'
          onClick={() => handleShapeClick(name)}
        >
          <Icon size={24} style={{ pointerEvents: 'none' }} />
        </button>
      ))}
    </div>
  );
};

export default ShapesOptions;
