import { useState, useEffect } from 'react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';
import { fonts } from '@/constants/fonts';
import CustomSelect from '@/components/reusable/CustomSelect';

const FontFamily = () => {
  const [fontFamily, setFontFamily] = useState('');

  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Sync font state with the currently selected object
  useEffect(() => {
    if (activeObject) {
      setFontFamily(activeObject.fontFamily);
    }
  }, [activeObject]);

  // Apply selected font to active object
  const handleFontFamilyChange = async (fontFamily) => {
    if (!canvasEditor || !activeObject) return;

    setFontFamily(fontFamily);

    const fontWeight = activeObject.fontWeight || 'normal';
    const fontStyle = activeObject.fontStyle || 'normal';

    // Ensure the specific Google Font variant is loaded before applying
    await document.fonts.load(`${fontStyle} ${fontWeight} 1em ${fontFamily}`);

    activeObject.set({
      fontFamily,
      fontWeight,
      fontStyle,
    });

    // Recalculate dimensions for text objects
    if (activeObject.type === 'i-text' || activeObject.type === 'textbox') {
      activeObject.initDimensions();
    }

    // Force redraw on canvas
    activeObject.dirty = true;
    canvasEditor.requestRenderAll();
  };

  return (
    <div data-cy="font-select">
      <label>
        <span className='text-sm font-medium block mb-2'>Font</span>
        <CustomSelect
          options={fonts}
          value={fontFamily}
          onChange={handleFontFamilyChange}
        />
      </label>
    </div>
  );
};

export default FontFamily;
