import { useState, useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';

// Options for text alignment buttons
const alignmentOptions = [
  {
    icon: AlignLeft,
    alignmentDirection: 'left',
  },
  {
    icon: AlignCenter,
    alignmentDirection: 'center',
  },
  {
    icon: AlignRight,
    alignmentDirection: 'right',
  },
  {
    icon: AlignJustify,
    alignmentDirection: 'justify',
  },
];

const TextAlignment = () => {
  const [textAlignment, setTextAlignment] = useState('');

  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Initialize alignment from the active object
  useEffect(() => {
    if (activeObject) {
      setTextAlignment(activeObject.textAlign);
    }
  }, [activeObject]);

  // Update alignment when a button is clicked
  const handleTextAlignmentClick = (alignment) => {
    if (!canvasEditor || !activeObject) return;

    // Only apply to text objects
    if (activeObject.type === 'i-text' || activeObject.type === 'textbox') {
      setTextAlignment(alignment);

      activeObject.set('textAlign', alignment);
      canvasEditor.renderAll();
    }
  };

  return (
    <>
      <div className='text-sm font-medium mb-2'>Alignment</div>
      <div className='flex justify-between'>
        {alignmentOptions.map(({ icon: Icon, alignmentDirection }) => (
          <div
            key={alignmentDirection}
            className={`group flex flex-col items-center cursor-pointer`}
            onClick={() => handleTextAlignmentClick(alignmentDirection)}
          >
            {/* Button for alignment */}
            <button
              className={`p-1 rounded mb-1 ${textAlignment === alignmentDirection ? 'bg-white' : 'group-hover:bg-neutral-600'}`}
            >
              <Icon
                size={18}
                className={`${textAlignment === alignmentDirection ? 'text-black' : 'text-gray-300 group-hover:text-white'}`}
              />
            </button>

            {/* Label below icon */}
            <span
              className={`text-xs capitalize mt-1 ${textAlignment === alignmentDirection ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}
            >
              {alignmentDirection}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default TextAlignment;
