import { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Italic, Underline } from 'lucide-react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';

const FontStyles = () => {
  const [fontStyles, setFontStyles] = useState([]);

  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Sync state with active object's current styles
  useEffect(() => {
    if (!activeObject) return;

    const styles = [];
    if (activeObject.fontWeight === 'bold') styles.push('bold');
    if (activeObject.fontStyle === 'italic') styles.push('italic');
    if (activeObject.underline) styles.push('underline');

    setFontStyles(styles);
  }, [activeObject]);

  // Apply selected font styles to active object
  const handleFontStylesChange = async (selectedStyles) => {
    if (!canvasEditor || !activeObject) return;

    const fontWeight = selectedStyles.includes('bold') ? 'bold' : 'normal';
    const fontStyle = selectedStyles.includes('italic') ? 'italic' : 'normal';
    const underline = selectedStyles.includes('underline');

    setFontStyles(selectedStyles);

    // Ensure the Google Font variant is loaded
    if (activeObject.fontFamily) {
      await document.fonts.load(
        `${fontStyle} ${fontWeight} 1em ${activeObject.fontFamily}`
      );
    }

    activeObject.set({ fontWeight, fontStyle, underline });

    // Recalculate dimensions for text objects
    if (activeObject.type === 'i-text' || activeObject.type === 'textbox') {
      activeObject.initDimensions();
    }

    // Force canvas redraw
    activeObject.dirty = true;
    canvasEditor.requestRenderAll();
  };

  return (
    <div className='flex items-center justify-between'>
      <span className='text-sm font-medium'>Font Style</span>
      <ToggleGroup
        type='multiple'
        size='lg'
        value={fontStyles}
        onValueChange={(fontStyles) => handleFontStylesChange(fontStyles)}
      >
        <ToggleGroupItem value='bold' aria-label='Toggle bold'>
          <Bold className='h-4 w-4' />
        </ToggleGroupItem>
        <ToggleGroupItem value='italic' aria-label='Toggle italic'>
          <Italic className='h-4 w-4' />
        </ToggleGroupItem>
        <ToggleGroupItem value='underline' aria-label='Toggle underline'>
          <Underline className='h-4 w-4' />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default FontStyles;
