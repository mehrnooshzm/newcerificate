import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Italic, Underline } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { IText } from 'fabric';
import { fonts } from '@/constants/fonts';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import ColorPicker from '@/features/controls/ColorPicker';
import CustomSelect from '@/components/reusable/CustomSelect';

const CanvasText = () => {
  const { canvasEditor } = useCanvasContext(); // get canvas instance

  const [text, setText] = useState('Sample text'); // text input value
  const [textStyles, setTextStyles] = useState([]); // bold, italic, underline
  const [textProperties, setTextProperties] = useState({
    left: 100,
    top: 100,
    color: 'rgba(0, 0, 0, 1)',
    fontSize: 22,
    fontFamily: 'Lato',
  });

  // Update text color
  const handleColorChange = ({ r, g, b, a }) => {
    const color = `rgba(${r}, ${g}, ${b}, ${a})`;

    setTextProperties((prev) => ({
      ...prev,
      color,
    }));
  };

  // Update font family
  const handleFontChange = (value) => {
    setTextProperties((prev) => ({
      ...prev,
      fontFamily: value,
    }));
  };

  // Generic property change handler (e.g., color, font size)
  const handlePropertyChange = (e) => {
    const { name, value } = e.target;

    setTextProperties((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add the text to the canvas
  const handleClick = () => {
    if (canvasEditor) {
      const { color, ...fabricTextProperties } = textProperties;

      // left/top/fontSize above are canonical-space values; scale them to
      // match however the current page is displayed right now (see the
      // matching comment in ShapesOptions.jsx for why this is required).
      const scale = canvasEditor._lastContentScale ?? 1;
      const offsetX = canvasEditor._lastContentOffsetX ?? 0;

      const textRef = new IText(text, {
        ...fabricTextProperties,
        left: fabricTextProperties.left * scale + offsetX,
        top: fabricTextProperties.top * scale,
        scaleX: scale,
        scaleY: scale,
        fill: color,
        strokeWidth: 0,
        fontWeight: textStyles.includes('bold') ? 'bold' : 'normal',
        fontStyle: textStyles.includes('italic') ? 'italic' : 'normal',
        underline: textStyles.includes('underline'),
      });

      canvasEditor.add(textRef);
      canvasEditor.renderAll();
    }
  };

  return (
    <>
      <h3 className='text-lg font-semibold'>Text Settings</h3>

      {/* Color Picker */}
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium'>Color</span>
        <Popover>
          <PopoverTrigger
            className='w-10 h-5 rounded bg-transparent border cursor-pointer'
            style={{ backgroundColor: textProperties.color }}
          ></PopoverTrigger>
          <PopoverContent
            side='right'
            align='start'
            sideOffset={20}
            className='w-64 p-3'
            style={{ background: 'var(--gradient-dark-color)' }}
          >
            <ColorPicker
              value={textProperties.color}
              handleColorChange={handleColorChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Font Size Input */}
      <div className='flex items-center justify-between'>
        <label htmlFor='textFontSize' className='text-sm'>
          Font Size
        </label>
        <input
          id='textFontSize'
          name='fontSize'
          type='number'
          min='10'
          max='100'
          value={textProperties.fontSize}
          onChange={handlePropertyChange}
          className='w-20 p-1 border rounded bg-transparent text-white'
        />
      </div>

      {/* Font Dropdown */}
      <div>
        <label>
          <span className='text-sm block mb-1'>Font</span>
          <CustomSelect
            options={fonts}
            value={textProperties.fontFamily}
            onChange={handleFontChange}
          />
        </label>
      </div>

      {/* Font Style Toggle Group */}
      <div>
        <span className='text-sm block mb-1'>Font Style</span>
        <ToggleGroup
          type='multiple'
          size='lg'
          value={textStyles}
          onValueChange={setTextStyles}
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

      {/* Text Input */}
      <div>
        <label htmlFor='textContent' className='text-sm block mb-1'>
          Text
        </label>
        <div className='rounded overflow-y-auto max-h-32 min-h-[80px] scrollbar-gutter-stable w-full'>
          <Textarea
            id='textContent'
            name='textContent'
            value={text}
            placeholder='Type your text here'
            onChange={({ target }) => setText(target.value)}
            className='min-h-[80px] w-full resize-none'
          />
        </div>
      </div>

      {/* Live Preview */}
      <div className='border-t border-gray-600 pt-4'>
        <span className='text-sm mb-2 block'>Live Preview</span>
        <div
          style={{
            color: textProperties.color,
            fontSize: `${textProperties.fontSize}px`,
            fontFamily: textProperties.fontFamily,
            fontWeight: textStyles.includes('bold') ? 'bold' : 'normal',
            fontStyle: textStyles.includes('italic') ? 'italic' : 'normal',
            textDecoration: textStyles.includes('underline')
              ? 'underline'
              : 'none',
            maxHeight: '120px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
          }}
          className='p-2 bg-white text-black rounded overflow-y-auto max-h-32 min-h-[80px] scrollbar-gutter-stable w-full'
        >
          {text}
        </div>
      </div>

      {/* Add text to canvas button */}
      <button
        className='block px-3 py-1 rounded bg-[#B3B3B3] text-white mx-auto hover:bg-[var(--secondary-color)] transition-colors'
        onClick={handleClick}
      >
        Add text
      </button>
    </>
  );
};

export default CanvasText;
