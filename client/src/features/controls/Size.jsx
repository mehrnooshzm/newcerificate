import { useState, useEffect } from 'react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';

const fields = [
  { dimension: 'width', label: 'W' },
  { dimension: 'height', label: 'H' },
];

const Size = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Initialize dimensions from active object
  useEffect(() => {
    if (activeObject) {
      const targetObject = getTargetObject();

      setDimensions({
        width: Number((targetObject.width * targetObject.scaleX).toFixed(2)),
        height: Number((targetObject.height * targetObject.scaleY).toFixed(2)),
      });
    }
  }, [activeObject]);

  // Determine the target object (group or individual)
  const getTargetObject = () => {
    // If it's a dynamic field text inside a group, use the group
    return activeObject.group?.type === 'custom-group'
      ? activeObject.group
      : activeObject;
  };

  // Update dimensions immediately while typing
  const handleChange = (dimension, value) => {
    setDimensions((prev) => ({ ...prev, [dimension]: value })); // temporarily store value as a string

    if (value === '' || !canvasEditor || !activeObject) return; // allow empty input without breaking

    const targetObject = getTargetObject();

    if (dimension === 'width') {
      targetObject.set(
        'scaleX',
        Number((Number(value) / targetObject.width).toFixed(2))
      );
    } else {
      targetObject.set(
        'scaleY',
        Number((Number(value) / targetObject.height).toFixed(2))
      );
    }

    targetObject.setCoords();
    canvasEditor.renderAll();
  };

  // Commit value on blur or Enter (convert to 0 if empty string)
  const handleSubmit = (dimension, value) => {
    if (!canvasEditor || !activeObject) return;

    value = isNaN(value) ? 0 : Number(Number(value).toFixed(2));

    setDimensions((prev) => ({ ...prev, [dimension]: value }));

    const targetObject = getTargetObject();

    if (dimension === 'width') {
      targetObject.set(
        'scaleX',
        Number((value / targetObject.width).toFixed(2))
      );
    } else {
      targetObject.set(
        'scaleY',
        Number((value / targetObject.height).toFixed(2))
      );
    }

    targetObject.setCoords();
    canvasEditor.renderAll();
  };

  return (
    <>
      <div className='text-sm font-medium'>Dimensions</div>
      <div className='flex justify-between items-center gap-3'>
        {fields.map(({ dimension, label }) => (
          <div key={dimension} className='relative'>
            <input
              id={`scale-${dimension}`}
              type='number'
              className='w-full p-1 text-white text-sm pl-[30px] rounded bg-neutral-600'
              value={dimensions[dimension].toString()}
              onChange={({ target }) => handleChange(dimension, target.value)}
              onBlur={({ target }) => handleSubmit(dimension, target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(dimension, e.target.value);
                  e.target.blur();
                }
              }}
            />
            {/* Label inside input */}
            <span className='absolute top-1/2 left-[10px] -translate-y-1/2 text-xs text-gray-400'>
              {label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Size;
