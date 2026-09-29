import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';

const Opacity = () => {
  const [opacity, setOpacity] = useState('');
  const [editing, setEditing] = useState(false);

  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Sync opacity state with active object
  useEffect(() => {
    if (activeObject) {
      setOpacity(String(Math.round(activeObject.opacity * 100)));
    }
  }, [activeObject]);

  // Update opacity live as user types or moves the slider
  const handleOpacityChange = (value) => {
    setOpacity(value);

    if (!canvasEditor || !activeObject) return;
    if (value === '') return; // allow empty input

    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      activeObject.set('opacity', parsed / 100);
      canvasEditor.renderAll();
    }
  };

  // Commit on blur or Enter (convert empty string to 0)
  const handleOpacitySubmit = (value) => {
    if (!canvasEditor || !activeObject) return;

    let parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) parsed = 0;
    if (parsed > 100) parsed = 100;

    activeObject.set('opacity', parsed / 100);
    canvasEditor.renderAll();

    setOpacity(String(parsed));
    setEditing(false);
  };

  return (
    <div className='space-y-2'>
      <div className='text-sm font-medium mb-2'>Opacity</div>
      <div className='flex justify-between items-center gap-3'>
        {/* Slider */}
        <Slider
          min={0}
          max={100}
          step={1}
          value={[Number(opacity)] || 0}
          onValueChange={(value) => handleOpacityChange(String(value[0]))}
          className='flex-1'
        />
        {/* Inline editable opacity label */}
        {editing ? (
          <input
            id='opacity'
            type='number'
            min='0'
            max='100'
            autoFocus
            value={opacity}
            onChange={({ target }) => handleOpacityChange(target.value)}
            onBlur={({ target }) => handleOpacitySubmit(target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleOpacitySubmit(e.target.value);
                e.target.blur(); // remove focus on Enter
              }
            }}
            className='w-14 bg-gray-700 border border-gray-600 rounded text-center text-white'
          />
        ) : (
          <span
            className='text-sm text-gray-300 cursor-pointer hover:text-white'
            onClick={() => setEditing(true)}
          >
            {opacity || 0}%
          </span>
        )}
      </div>
    </div>
  );
};

export default Opacity;
