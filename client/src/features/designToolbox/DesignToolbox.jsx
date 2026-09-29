import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import CSVUpload from './CSVUpload';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { toolboxOptions } from '@/constants/editorSettings.jsx';
import {
  applyPageSettings,
  fitCanvasToContainer,
} from '@/utils/canvasSettings';
import TemplatePicker from './TemplatePicker';

const HorizontalLine = () => <hr className='bg-gray-600 my-3' />;
const DEFAULT_CUSTOM_SIZE = 800;

const PAGE_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4' },
  { value: 'letter', label: 'Letter' },
  { value: 'custom', label: 'Custom Size' },
];

const DesignToolbox = () => {
  const [openPopover, setOpenPopover] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const {
    canvasEditor,
    size,
    setSize,
    orientation,
    setOrientation,
    customWidth,
    setCustomWidth,
    customHeight,
    setCustomHeight,
    saveHistory,
  } = useCanvasContext();
  const { id } = useParams();

  // Local draft state for the custom width/height inputs before "Apply"
  const [draftWidth, setDraftWidth] = useState(
    customWidth || DEFAULT_CUSTOM_SIZE
  );
  const [draftHeight, setDraftHeight] = useState(
    customHeight || DEFAULT_CUSTOM_SIZE
  );

  // Get design from Redux if editing an existing design
  const design = useSelector(({ designs }) =>
    id ? designs.find((design) => design.id === id) : null
  );

  const titleStyles = 'text-xs font-semibold text-gray-300';
  const buttonStyles =
    'px-2 py-1 rounded bg-[#B3B3B3] hover:bg-[var(--button-hover-color-out)] text-white hover:text-[var(--primary-color)] text-xs';
  const selectStyles =
    'w-full px-2 py-1.5 rounded bg-[#B3B3B3] text-white text-xs outline-none';
  const inputStyles =
    'w-1/2 px-2 py-1 rounded bg-[#B3B3B3] text-white text-xs outline-none';

  // Set initial page size and orientation from design
  useEffect(() => {
    if (design) {
      setSize(design.size);
      setOrientation(design.orientation);
      if (design.size === 'custom') {
        const width = Number(design.customWidth) || DEFAULT_CUSTOM_SIZE;
        const height = Number(design.customHeight) || DEFAULT_CUSTOM_SIZE;
        setCustomWidth(width);
        setCustomHeight(height);
        setDraftWidth(width);
        setDraftHeight(height);
      }
    }
  }, [design?.id]);

  const getCustomDimensions = () =>
    size === 'custom' ? { width: customWidth, height: customHeight } : null;

  // Apply page settings to canvas whenever size, orientation, or custom dims change
  useEffect(() => {
    if (!canvasEditor || id) return;

    applyPageSettings(canvasEditor, size, orientation, getCustomDimensions());

    // Scale canvas to fit its container
    fitCanvasToContainer(canvasEditor);
  }, [canvasEditor, size, orientation, customWidth, customHeight, id]);

  // Track mobile viewport for popover placement
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update page size (dropdown)
  const handleSizeChange = (e) => {
    const newSize = e.target.value;
    if (!canvasEditor) return;
    setSize(newSize);

    if (newSize === 'custom') {
      // Don't apply immediately — wait for user to enter dimensions and hit Apply
      setCustomWidth(draftWidth);
      setCustomHeight(draftHeight);
      applyPageSettings(canvasEditor, newSize, orientation, {
        width: draftWidth,
        height: draftHeight,
      });
    } else {
      applyPageSettings(canvasEditor, newSize, orientation);
    }
    // applyPageSettings alone leaves the canvas at zoom=1 (raw pixel size).
    // The effect below normally fits it to the container, but that effect
    // is skipped while editing an existing design (see its `id` guard), so
    // fit here too — harmless to call twice.
    fitCanvasToContainer(canvasEditor);

    // Record this as its own undo step. Page size isn't part of the
    // Fabric canvas JSON, so without this, Undo would leave the size
    // change untouched while reverting everything else.
    saveHistory(canvasEditor);
  };

  // Update page orientation
  // Update page orientation
  const handleOrientationClick = (newOrientation) => {
    if (!canvasEditor) return;
    setOrientation(newOrientation);

    if (size === 'custom') {
      const longSide = Math.max(customWidth, customHeight);
      const shortSide = Math.min(customWidth, customHeight);

      const newWidth = newOrientation === 'landscape' ? longSide : shortSide;
      const newHeight = newOrientation === 'landscape' ? shortSide : longSide;

      setCustomWidth(newWidth);
      setCustomHeight(newHeight);
      setDraftWidth(newWidth); // keep inputs in sync so user sees the swap
      setDraftHeight(newHeight);

      applyPageSettings(canvasEditor, 'custom', newOrientation, {
        width: newWidth,
        height: newHeight,
      });
    } else {
      applyPageSettings(canvasEditor, size, newOrientation);
    }
    fitCanvasToContainer(canvasEditor);

    // Record the orientation change as its own undo step (see note above).
    saveHistory(canvasEditor);
  };

  // Apply custom width/height from the draft inputs
  const handleApplyCustomSize = () => {
    if (!canvasEditor) return;
    const width = Number(draftWidth);
    const height = Number(draftHeight);
    if (!width || !height || width <= 0 || height <= 0) return;

    // Auto-detect orientation from the values themselves — never swap the numbers
    const detectedOrientation = width >= height ? 'landscape' : 'portrait';

    setCustomWidth(width);
    setCustomHeight(height);
    setOrientation(detectedOrientation);

    applyPageSettings(canvasEditor, 'custom', detectedOrientation, {
      width,
      height,
    });
    fitCanvasToContainer(canvasEditor);

    // Record the custom-size change as its own undo step (see note above).
    saveHistory(canvasEditor);
  };

  return (
    <aside
      className='flex flex-col w-64 text-white p-6 space-y-2 h-full overflow-y-auto'
      style={{ background: 'var(--gradient-dark-color)' }}
    >
      {/* Dashboard */}
      <Link
        to='/'
        className='text-lg font-semibold hover:text-[var(--tertiary-color)]'
      >
        Dashboard
      </Link>
      <HorizontalLine />

      {/* Templates */}
      <TemplatePicker
        isMobileView={isMobileView}
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      />

      <HorizontalLine />

      {/* Page Size & Orientation */}
      <section>
        <span className='text-[0.94rem] font-semibold flex justify-between items-center mb-2'>
          Page Settings
        </span>

        <span className={titleStyles}>Page Size</span>
        <select
          className={`${selectStyles} mt-1 mb-2`}
          value={size}
          onChange={handleSizeChange}
        >
          {PAGE_SIZE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Custom size inputs — only shown when "Custom Size" is selected */}
        {size === 'custom' && (
          <div className='space-y-2 mb-2'>
            <div className='flex space-x-2'>
              <div className='w-1/2 flex flex-col gap-1'>
                <label className={titleStyles}>Width</label>
                <input
                  type='number'
                  min={1}
                  className={`${inputStyles} w-full`}
                  placeholder='Width'
                  value={draftWidth}
                  onChange={(e) => setDraftWidth(e.target.value)}
                />
              </div>
              <div className='w-1/2 flex flex-col gap-1'>
                <label className={titleStyles}>Height</label>
                <input
                  type='number'
                  min={1}
                  className={`${inputStyles} w-full`}
                  placeholder='Height'
                  value={draftHeight}
                  onChange={(e) => setDraftHeight(e.target.value)}
                />
              </div>
            </div>
            <button
              className={`${buttonStyles} w-full`}
              onClick={handleApplyCustomSize}
            >
              Apply
            </button>
          </div>
        )}

        <span className={titleStyles}>Page Orientation</span>
        <div className='flex space-x-2 mt-1 mb-2'>
          <button
            className={`w-1/2 ${buttonStyles} ${orientation === 'landscape' ? 'bg-[var(--button-hover-color-on)]' : ''}`}
            onClick={() => handleOrientationClick('landscape')}
          >
            Landscape
          </button>
          <button
            className={`w-1/2 ${buttonStyles} ${orientation === 'portrait' ? 'bg-[var(--button-hover-color-on)]' : ''}`}
            onClick={() => handleOrientationClick('portrait')}
          >
            Portrait
          </button>
        </div>
      </section>

      <HorizontalLine />

      {/* Toolbox Options */}
      <section className='space-y-2'>
        {toolboxOptions.map(({ name, component }) => (
          <div key={name}>
            {isMobileView ? (
              <>
                <button
                  type='button'
                  data-cy={`toolbox-${name.toLowerCase()}-trigger`}
                  onClick={() =>
                    setOpenPopover((curr) => (curr === name ? null : name))
                  }
                  className='flex w-full justify-between items-center gap-1 px-0 py-1 text-white text-[0.94rem] font-semibold hover:opacity-80'
                >
                  <span>{name}</span>
                  {openPopover === name ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
                {openPopover === name && (
                  <div
                    className='mt-2 w-full bg-[#373737] border-0 text-gray-300 p-3 rounded-none shadow-lg space-y-2 text-xs'
                    style={{ background: 'var(--gradient-dark-color)' }}
                  >
                    {component}
                  </div>
                )}
              </>
            ) : (
              <Popover
                open={openPopover === name}
                onOpenChange={(isOpen) => setOpenPopover(isOpen ? name : null)}
              >
                <PopoverTrigger
                  data-cy={`toolbox-${name.toLowerCase()}-trigger`}
                  className='flex w-full justify-between items-center gap-1 px-0 py-1 text-white text-[0.94rem] font-semibold hover:opacity-80'
                >
                  <span>{name}</span>
                  {openPopover === name ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </PopoverTrigger>
                <PopoverContent
                  side='right'
                  sideOffset={30}
                  className='w-64 bg-[#373737] border-0 text-gray-300 p-3 rounded-none shadow-lg space-y-2 text-xs'
                  style={{ background: 'var(--gradient-dark-color)' }}
                >
                  {component}
                </PopoverContent>
              </Popover>
            )}
          </div>
        ))}
      </section>

      {/* CSV Upload */}
      <section className='flex justify-between items-center text-[0.94rem] font-semibold '>
        <CSVUpload />
      </section>
    </aside>
  );
};

export default DesignToolbox;
