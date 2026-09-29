import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';

const StrokeWidth = () => {
  const [strokeWidth, setStrokeWidth] = useState('');

  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Initialize stroke width when active object changes
  useEffect(() => {
    if (activeObject) {
      setStrokeWidth(activeObject.strokeWidth);
    }
  }, [activeObject]);

  // Update stroke width on click (+/- buttons)
  const handleStrokeWidthClick = (width) => {
    if (!canvasEditor || !activeObject) return;

    if (width >= 0) {
      setStrokeWidth(width);

      activeObject.set({ strokeWidth: width });
      canvasEditor.renderAll();
    }
  };

  return (
    <div className='flex items-center justify-between'>
      {/* Label */}
      <div className='text-sm font-medium'>Stroke Width</div>

      {/* Controls: decrease, display, increase */}
      <div className='flex items-center'>
        <button
          className='p-1 rounded text-gray-300 hover:text-white hover:bg-neutral-600'
          onClick={() => handleStrokeWidthClick(strokeWidth - 1)}
          aria-label='Decrease stroke width'
        >
          <Minus size={14} />
        </button>
        <span className='mx-2 text-sm w-8 text-center'>{strokeWidth}px</span>
        <button
          className='p-1 rounded text-gray-300 hover:text-white hover:bg-neutral-600'
          onClick={() => handleStrokeWidthClick(strokeWidth + 1)}
          aria-label='Increase stroke width'
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

export default StrokeWidth;
