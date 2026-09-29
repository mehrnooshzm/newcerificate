import { useState, useEffect } from 'react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';

const FontSize = () => {
  const [fontSize, setFontSize] = useState('');

  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Sync font size state with the currently selected object
  useEffect(() => {
    if (activeObject) {
      setFontSize(activeObject.fontSize);
    }
  }, [activeObject]);

  // Apply the selected font size to the active object
  const handleFontSizeChange = (fontSize) => {
    if (!canvasEditor || !activeObject) return;

    setFontSize(fontSize);

    activeObject.set({ fontSize });
    canvasEditor.renderAll(); // Redraw canvas
  };

  return (
    <div className='flex items-center justify-between'>
      <label htmlFor='fontSize' className='text-sm font-medium'>
        Font Size
      </label>
      <input
        id='fontSize'
        name='fontSize'
        type='number'
        min='10'
        max='100'
        value={fontSize}
        onChange={({ target }) => handleFontSizeChange(target.value)}
        className='w-20 px-2 py-1 text-white text-sm rounded bg-neutral-600'
      />
    </div>
  );
};

export default FontSize;
