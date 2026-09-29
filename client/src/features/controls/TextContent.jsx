import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useActiveObject } from '@/hooks/useActiveObject';

const TextContent = () => {
  const [text, setText] = useState('');

  const { canvasEditor } = useCanvasContext();
  const activeObject = useActiveObject();

  // Initialize text state from the active object
  useEffect(() => {
    if (activeObject) {
      setText(activeObject.text);
    }
  }, [activeObject]);

  // Update active object's text on change
  const handleTextContentChange = (text) => {
    if (!canvasEditor || !activeObject) return;

    setText(text); // update local state

    activeObject.set({ text }); // update canvas object
    canvasEditor.renderAll(); // redraw canvas
  };

  return (
    <div>
      <label htmlFor='text' className='text-sm font-medium block mb-2'>
        Text
      </label>

      {/* Editable textarea for object text */}
      <Textarea
        id='text'
        name='text'
        value={text}
        placeholder='Type your text here'
        className='w-full px-2 py-1 text-white text-sm rounded bg-neutral-600 border-0 focus-visible:border-0 focus-visible:ring-0'
        onChange={({ target }) => handleTextContentChange(target.value)}
      />
    </div>
  );
};

export default TextContent;
