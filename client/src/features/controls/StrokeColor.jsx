import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';
import ColorPicker from './ColorPicker';

const StrokeColor = () => {
  const [color, setColor] = useState('rgba(0, 0, 0, 1)');
  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Initialize stroke color when active object changes
  useEffect(() => {
    if (activeObject) {
      setColor(activeObject.stroke ?? 'rgba(0, 0, 0, 1)');
    }
  }, [activeObject]);

  // Update active object's stroke color
  const handleColorChange = ({ r, g, b, a }) => {
    if (!canvasEditor || !activeObject) return;

    const color = `rgba(${r}, ${g}, ${b}, ${a})`;

    setColor(color);

    activeObject.set({ stroke: color });
    canvasEditor.renderAll();
  };

  return (
    <div className='flex items-center justify-between'>
      {/* Label */}
      <span className='text-sm font-medium'>Stroke Color</span>
      {/* Color picker popover */}
      <Popover>
        <PopoverTrigger
          className='w-10 h-5 bg-transparent cursor-pointer'
          style={{
            backgroundColor: color,
          }}
        ></PopoverTrigger>
        <PopoverContent
          side='left'
          align='start'
          sideOffset={10}
          className='w-64 p-3'
          style={{ background: 'var(--gradient-dark-color)' }}
        >
          <ColorPicker value={color} handleColorChange={handleColorChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default StrokeColor;
