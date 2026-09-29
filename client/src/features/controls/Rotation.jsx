import { useState, useEffect, useRef } from 'react';
import { RotateCw, RotateCcw, TriangleRight } from 'lucide-react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';

const ROTATION_ANGLE = 5;

const rotationOptions = [
  {
    direction: 'left',
    icon: RotateCcw,
  },
  {
    direction: 'right',
    icon: RotateCw,
  },
];

const Rotation = () => {
  const [angle, setAngle] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  const inputRef = useRef(null);

  // Sync state with active object's current angle
  useEffect(() => {
    if (activeObject) {
      const targetObject = getTargetObject();
      setAngle(targetObject.angle ?? 0);
    }
  }, [activeObject]);

  // Focus input when editing
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  // Determine the target object (group or individual)
  const getTargetObject = () => {
    // If it's a dynamic field text inside a group, use the group
    return activeObject.group?.type === 'custom-group'
      ? activeObject.group
      : activeObject;
  };

  // Apply rotation while preserving object's original origin
  const applyRotation = (newAngle) => {
    if (!canvasEditor || !activeObject) return;

    const targetObject = getTargetObject();

    // Save previous origin
    const prevOriginX = targetObject.originX;
    const prevOriginY = targetObject.originY;

    // Canvas point of current center
    const center = targetObject.getCenterPoint();

    // Temporarily switch to center origin and anchor to center point
    targetObject.set({
      originX: 'center',
      originY: 'center',
    });
    targetObject.setPositionByOrigin(center, 'center', 'center');

    // Apply rotation about center
    targetObject.set('angle', newAngle);
    targetObject.setCoords();

    // Find where the old origin point is now
    const prevOriginCanvasPoint = targetObject.getPointByOrigin(
      prevOriginX,
      prevOriginY
    );

    // Restore previous origin and place that origin back at same canvas point
    targetObject.set({
      originX: prevOriginX,
      originY: prevOriginY,
    });
    targetObject.setPositionByOrigin(
      prevOriginCanvasPoint,
      prevOriginX,
      prevOriginY
    );

    targetObject.setCoords();
    canvasEditor.requestRenderAll?.() ?? canvasEditor.renderAll();
  };

  const handleRotationClick = (direction) => {
    if (!canvasEditor || !activeObject) return;

    const targetObject = getTargetObject();

    const delta = direction === 'left' ? -ROTATION_ANGLE : ROTATION_ANGLE;
    const newAngle = (targetObject.angle ?? 0) + delta;
    setAngle(newAngle);
    applyRotation(newAngle);
  };

  const handleInputChange = (e) => {
    setAngle(e.target.value); // keep raw value while typing
  };

  const handleInputBlur = (e) => {
    setIsEditing(false);

    const parsed = parseFloat(e.target.value);
    const finalAngle = isNaN(parsed) ? 0 : parsed;
    setAngle(finalAngle);
    applyRotation(finalAngle);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur(); // triggers blur and save
    }
  };

  return (
    <>
      <div className='text-sm font-medium mb-2'>Rotation</div>
      <div className='flex justify-between items-center gap-4'>
        <div className='w-1/2 flex gap-6'>
          {rotationOptions.map(({ direction, icon: Icon }) => (
            <div
              key={direction}
              className='group flex flex-col items-center cursor-pointer'
              onClick={() => handleRotationClick(direction)}
            >
              <button className='p-1 rounded mb-1 group-hover:bg-neutral-600'>
                <Icon
                  size={18}
                  className='text-gray-300 group-hover:text-white'
                />
              </button>
              <span className='text-xs capitalize mt-1 text-gray-300 group-hover:text-white'>
                {direction}
              </span>
            </div>
          ))}
        </div>
        {/* Angle input */}
        <div className='relative w-1/2'>
          {isEditing ? (
            <input
              type='number'
              value={angle}
              ref={inputRef}
              className='w-full p-1 text-white text-sm pl-[40px] rounded bg-neutral-600'
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
            />
          ) : (
            <input
              type='text'
              value={`${angle}${String.fromCharCode(176)}`}
              className='w-full p-1 text-white text-sm pl-[40px] rounded bg-neutral-600'
              onClick={() => setIsEditing(true)}
              readOnly
            />
          )}
          <TriangleRight
            size={18}
            className='absolute top-1/2 left-[10px] -translate-y-1/2 text-xs text-gray-400'
          />
        </div>
      </div>
    </>
  );
};

export default Rotation;
