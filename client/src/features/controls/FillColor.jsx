import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';
import ColorPicker from './ColorPicker';

const FillColor = () => {
  const [color, setColor] = useState(
    'rgba(0, 0, 0, 1)'
  );

  const {
    canvasEditor,
    saveHistory,
  } = useCanvasContext();

  const activeObject = useActiveObject();

  // Update local color when the selected object changes
  useEffect(() => {
    if (activeObject) {
      setColor(activeObject.fill);
    }
  }, [activeObject]);

  // Change color while dragging inside ChromePicker
  // Do NOT save history here because ChromePicker
  // fires this many times during one color selection.
  const handleColorChange = ({
    r,
    g,
    b,
    a,
  }) => {
    if (!canvasEditor || !activeObject) return;

    const newColor = `rgba(${r}, ${g}, ${b}, ${a})`;

    setColor(newColor);

    activeObject.set({
      fill: newColor,
    });

    canvasEditor.renderAll();
  };

  // Save only ONE history entry when ChromePicker
  // finishes the color selection.
  const handleColorChangeComplete = ({
    r,
    g,
    b,
    a,
  }) => {
    if (!canvasEditor || !activeObject) return;

    const finalColor = `rgba(${r}, ${g}, ${b}, ${a})`;

    setColor(finalColor);

    activeObject.set({
      fill: finalColor,
    });

    canvasEditor.renderAll();

    // One color selection = one undo step
    saveHistory(canvasEditor);
  };

  // CirclePicker makes one selection with one click,
  // so save one history entry immediately.
  const handleCircleColorChange = ({
    r,
    g,
    b,
    a,
  }) => {
    if (!canvasEditor || !activeObject) return;

    const newColor = `rgba(${r}, ${g}, ${b}, ${a})`;

    setColor(newColor);

    activeObject.set({
      fill: newColor,
    });

    canvasEditor.renderAll();

    // One CirclePicker click = one undo step
    saveHistory(canvasEditor);
  };

  return (
    <div className='flex items-center justify-between'>
      <span className='text-sm font-medium'>
        Fill Color
      </span>

      <Popover>
        <PopoverTrigger
          data-cy='fill-color-trigger'
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
          style={{
            background: 'var(--gradient-dark-color)',
          }}
        >
          <ColorPicker
            value={color}
            handleColorChange={handleColorChange}
            handleColorChangeComplete={
              handleColorChangeComplete
            }
            handleCircleColorChange={
              handleCircleColorChange
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FillColor;