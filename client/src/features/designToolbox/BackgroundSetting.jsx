import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import ColorPicker from '@/features/controls/ColorPicker';

const BackgroundSetting = () => {
  const { canvasEditor } = useCanvasContext(); // get canvas instance
  const { id } = useParams(); // design ID from URL, undefined for new designs

  // Get background color from Redux if editing an existing design, otherwise use default white
  const background = useSelector(({ designs }) => {
    if (!id) return 'rgba(255, 255, 255, 1)'; // default for new design

    const design = designs.find((design) => design.id === id);
    return design ? design.canvasData.background : 'rgba(255, 255, 255, 1)';
  });

  const [backgroundColor, setBackgroundColor] = useState(background);

  // Update canvas background color when user picks a new color
  const handleColorChange = ({ r, g, b, a }) => {
    const color = `rgba(${r}, ${g}, ${b}, ${a})`;

    canvasEditor.set({
      backgroundColor: color,
      backgroundImage: null, // remove any background image when color is changed
    });
    canvasEditor.renderAll();
    setBackgroundColor(color); // update local state
  };

  return (
    <ColorPicker
      value={backgroundColor}
      handleColorChange={handleColorChange}
    />
  );
};

export default BackgroundSetting;
