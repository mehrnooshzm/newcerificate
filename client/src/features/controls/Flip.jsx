import { useState, useEffect } from 'react';
import { FlipHorizontal2, FlipVertical2 } from 'lucide-react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';

// Options for flipping along X or Y axis
const flipOptions = [
  {
    axis: 'x',
    icon: FlipHorizontal2,
    label: 'Horizontal',
  },
  {
    axis: 'y',
    icon: FlipVertical2,
    label: 'Vertical',
  },
];

const Flip = () => {
  const [flip, setFlip] = useState({ x: '', y: '' });

  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Update flip state when active object changes
  useEffect(() => {
    if (activeObject) {
      setFlip({
        x: activeObject.flipX ?? false,
        y: activeObject.flipY ?? false,
      });
    }
  }, [activeObject]);

  // Toggle flip on the selected axis
  const handleFlipClick = (axis) => {
    if (!canvasEditor || !activeObject) return;

    setFlip((prev) => ({ ...prev, [axis]: !prev[axis] }));

    const property = axis === 'x' ? 'flipX' : 'flipY';
    activeObject.set(property, !flip[axis]);
    canvasEditor.renderAll();
  };

  return (
    <>
      <div className='text-sm font-medium mb-2'>Flip</div>
      <div className='flex gap-4'>
        {flipOptions.map(({ axis, icon: Icon, label }) => (
          <div
            key={label}
            className={`group flex flex-col items-center cursor-pointer`}
            onClick={() => handleFlipClick(axis)}
          >
            {/* Flip button with icon */}
            <button
              className={`p-1 rounded mb-1 ${flip[axis] ? 'bg-white' : 'group-hover:bg-neutral-600'}`}
            >
              <Icon
                size={18}
                className={`${flip[axis] ? 'text-black' : 'text-gray-300 group-hover:text-white'}`}
              />
            </button>
            {/* Label for flip axis */}
            <span
              className={`text-xs capitalize mt-1 ${flip[axis] ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Flip;
