import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { loadTemplateIntoCanvas } from '@/utils/loadTemplate';
import templateService from '@/services/templates';
import TemplateItem from './TemplateItem';

const TemplatePicker = ({ isMobileView, openPopover, setOpenPopover }) => {
  const [templates, setTemplates] = useState([]);

  const {
    canvasEditor,
    setSize,
    setOrientation,
    setCustomWidth,
    setCustomHeight,
    setName,
    saveHistory,
  } = useCanvasContext();

  // Fetch all available templates on component mount
  useEffect(() => {
    const getTemplates = async () => {
      const templates = await templateService.getAll();
      setTemplates(templates);
    };

    getTemplates();
  }, []);

  // Load the selected template into the canvas
  const handleItemClick = async (template) => {
    if (!canvasEditor) return;

    await loadTemplateIntoCanvas(
      canvasEditor,
      setSize,
      setOrientation,
      template,
      setName,
      setCustomWidth,
      setCustomHeight
    );

    // Record this as its own undo step — page size/orientation aren't
    // part of the Fabric canvas JSON, so without this, Undo would leave
    // the newly-loaded template's size/orientation untouched while
    // reverting everything else.
    saveHistory(canvasEditor);
  };

  const templateList = (
    <div className='grid grid-cols-1 gap-3'>
      {/* Render each template */}
      {templates.map((template) => (
        <div
          key={template.id}
          onClick={() => handleItemClick(template)}
          className='cursor-pointer'
        >
          <TemplateItem template={template} />
        </div>
      ))}
    </div>
  );

  // On mobile, render inline within the sidebar like the other toolbox options
  if (isMobileView) {
    return (
      <div>
        <button
          type='button'
          onClick={() =>
            setOpenPopover((curr) =>
              curr === 'Templates' ? null : 'Templates'
            )
          }
          className='flex w-full justify-between items-center gap-1 px-0 py-1 text-white text-[0.94rem] font-semibold hover:opacity-80'
        >
          <span>Templates</span>
          {openPopover === 'Templates' ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>
        {openPopover === 'Templates' && (
          <div
            className='mt-2 w-full max-h-[500px] overflow-y-scroll bg-[#373737] border-0 text-gray-300 p-3 rounded-none shadow-lg space-y-2 text-xs'
            style={{ background: 'var(--gradient-dark-color)' }}
          >
            {templateList}
          </div>
        )}
      </div>
    );
  }

  return (
    <Popover
      open={openPopover === 'Templates'}
      onOpenChange={(isOpen) => setOpenPopover(isOpen ? 'Templates' : null)}
    >
      {/* Popover trigger button */}
      <PopoverTrigger className='flex justify-between items-center text-[0.94rem] font-semibold hover:opacity-80'>
        <span>Templates</span>
        {openPopover === 'Templates' ? (
          <ChevronDown size={14} />
        ) : (
          <ChevronRight size={14} />
        )}
      </PopoverTrigger>

      {/* Popover content with template list */}
      <PopoverContent
        side='right'
        align='start'
        sideOffset={30}
        className='w-64 max-h-[500px] overflow-y-scroll bg-[#373737] border-0 text-gray-300 p-3 rounded-none shadow-lg space-y-2 text-xs'
        style={{ background: 'var(--gradient-dark-color)' }}
      >
        {templateList}
      </PopoverContent>
    </Popover>
  );
};

export default TemplatePicker;
