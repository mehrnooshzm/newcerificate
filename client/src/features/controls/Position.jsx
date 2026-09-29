import { useState, useEffect } from 'react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';

const fields = [
  {
    axis: 'x',
    label: 'X',
  },
  {
    axis: 'y',
    label: 'Y',
  },
];

const Position = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Sync position state with active object
  useEffect(() => {
    if (activeObject) {
      const targetObject = getTargetObject();

      setPosition({
        x: Number(targetObject.left.toFixed(2)),
        y: Number(targetObject.top.toFixed(2)),
      });
    }
  }, [activeObject]);

  // Determine which object to move (group or individual object)
  const getTargetObject = () => {
    // If it's a dynamic field text inside a group, use the group
    return activeObject.group?.type === 'custom-group'
      ? activeObject.group
      : activeObject;
  };

  // Update position immediately while typing
  const handleChange = (axis, value) => {
    setPosition((prev) => ({ ...prev, [axis]: value })); // temporarily store value as a string

    if (value === '' || !canvasEditor || !activeObject) return; // allow empty input without breaking

    const property = axis === 'x' ? 'left' : 'top';

    const targetObject = getTargetObject();
    targetObject.set(property, Number(Number(value).toFixed(2)));
    targetObject.setCoords();

    canvasEditor.renderAll();
  };

  // Commit on blur or Enter (convert to 0 if empty string)
  const handleSubmit = (axis, value) => {
    if (!canvasEditor || !activeObject) return;

    value = isNaN(value) ? 0 : Number(Number(value).toFixed(2));

    setPosition((prev) => ({ ...prev, [axis]: value }));

    const property = axis === 'x' ? 'left' : 'top';

    const targetObject = getTargetObject();
    targetObject.set(property, value);
    targetObject.setCoords();

    canvasEditor.renderAll();
  };

  return (
    <>
      <div className='text-sm font-medium'>Position</div>
      <div className='flex justify-between items-center gap-3'>
        {fields.map(({ axis, label }) => (
          <div key={axis} className='relative'>
            <input
              id={`position-${axis}`}
              type='number'
              className='w-full p-1 text-white text-sm pl-[30px] rounded bg-neutral-600'
              value={position[axis].toString()}
              onChange={({ target }) => handleChange(axis, target.value)}
              onBlur={({ target }) => handleSubmit(axis, target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(axis, e.target.value);
                  e.target.blur(); // remove focus on Enter
                }
              }}
            />
            <span className='absolute top-1/2 left-[10px] -translate-y-1/2 text-xs text-gray-400'>
              {label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Position;
