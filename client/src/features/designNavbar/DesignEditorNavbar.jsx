import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { supabase } from '@/supabase/supabase';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { resetPageSizeBaseline } from '@/utils/canvasSettings';
import { useCSVDataContext } from '@/hooks/useCSVDataContext';
import { createDesign, updateDesign } from '@/reducers/designReducer';
import { toast } from 'sonner';
import {
  Save as SaveIcon,
  LoaderCircle,
  Menu,
  Undo2,
  Redo2,
  Eye,
  X,
} from 'lucide-react';

import ExportToPNGandPDF from './ExportToPNGandPDF';
import CertificateName from './CertificateName';

const DesignEditorNavbar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isPreviewMode,
  onTogglePreviewMode,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const {
    canvasEditor,
    showCaptions,
    size,
    orientation,
    name,
    customWidth,
    customHeight,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useCanvasContext();
  
  const { CSVData, previewRowIndex } = useCSVDataContext();
  //batch export pdf
  const { id } = useParams(); // undefined when the URL is `/designs/new`

  // If editing an existing design, retrieve it from Redux
  const design = useSelector(({ designs }) => {
    if (!id) return null; // new design -> no canvas data
    return designs.find((design) => design.id === id) || null;
  });

  const dispatch = useDispatch();

  // Save or update design
  const handleSave = async () => {
    if (isSaving) return; // prevent double-trigger

    setIsSaving(true);

    // Generate PNG preview
    const fileName = `design-preview-${Date.now()}.png`;
    const dataURL = canvasEditor.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2,
    });
    const blob = await (await fetch(dataURL)).blob();

    try {
      // Upload new preview image to Supabase
      const { error } = await supabase.storage
        .from('user-design-previews')
        .upload(fileName, blob, { contentType: 'image/png' });

      if (error) {
        throw new Error('Upload error:', error);
      }

      const { data: url } = supabase.storage
        .from('user-design-previews')
        .getPublicUrl(fileName);

      // Only include custom dimensions when size is actually "custom"
      const customSizeFields =
        size === 'custom'
          ? { customWidth, customHeight }
          : { customWidth: null, customHeight: null };

      if (design) {
        // Delete previous preview image
        const { error } = await supabase.storage
          .from(design.designPreview.bucket)
          .remove([design.designPreview.fileName]); // remove expects an array

        if (error) {
          throw new Error(
            'Failed to delete image:',
            design.designPreview.fileName,
            error
          );
        }

        // Update existing design in Redux
        const updatedDesign = {
          ...design,
          name,
          canvasData: canvasEditor.toJSON(),
          designPreview: {
            fileName,
            bucket: 'user-design-previews',
            url: url.publicUrl,
          },
          size,
          orientation,
          showCaptions,
          ...customSizeFields,
          csvUploadId: CSVData?.id,
          csvRowIndex: previewRowIndex,
        };
        await dispatch(updateDesign(updatedDesign));
        resetPageSizeBaseline(
          canvasEditor,
          size === 'custom' ? { width: customWidth, height: customHeight } : null
        );
      } else {
        // Create new design
        const newDesign = {
          name,
          canvasData: canvasEditor.toJSON(),
          designPreview: {
            fileName,
            bucket: 'user-design-previews',
            url: url.publicUrl,
          },
          size,
          orientation,
          showCaptions,
          ...customSizeFields,
          csvUploadId: CSVData?.id,
          csvRowIndex: previewRowIndex,
        };

        const createdDesign = await dispatch(createDesign(newDesign));
        resetPageSizeBaseline(
          canvasEditor,
          size === 'custom' ? { width: customWidth, height: customHeight } : null
        );
        navigate(`/designs/${createdDesign.id}`); // navigate to new design
      }

      toast('Design saved successfully!');
    } catch (e) {
      console.error(e);
      toast('Failed to save the design.');
    } finally {
      setIsSaving(false);
    }
  };

  console.log('UNDO STACK:', undoStack.length, undoStack);
  return (
    <div
      id='editorSubheader'
      className='flex items-center justify-between gap-2 md:gap-5 bg-[var(--primary-color)] py-3 md:py-5 px-3 md:px-6 xl:px-[90px]'
    >
      {/* Left group: sidebar toggle + certificate name */}
      <div className='flex items-center gap-2 md:gap-5 min-w-0'>
        {!isPreviewMode && (
          <button
            type='button'
            aria-label='Open sidebar'
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className='inline-flex items-center justify-center shrink-0 p-2 rounded-md text-white hover:bg-[var(--secondary-color)] xl:hidden'
          >
            <Menu size={18} />
          </button>
        )}

        <CertificateName /> {/* Editable certificate title */}
      </div>

      {/* Right group: Quick Preview toggle (mobile/tablet) + Undo/Redo + save + export actions */}
      <div className='flex items-center gap-1 sm:gap-2 md:gap-5 shrink-0'>
        {/* Quick Preview: lets mobile/tablet users review the certificate
            without editing tool clutter. Not shown on desktop (xl+), where
            the full toolset is always visible anyway. Icon-only on the
            smallest screens (matches Save/PNG/PDF) so it doesn't crowd
            the other toolbar actions. */}
        <button
          type='button'
          onClick={onTogglePreviewMode}
          aria-label={isPreviewMode ? 'Exit preview' : 'Quick preview'}
          aria-pressed={isPreviewMode}
          className={`xl:hidden flex items-center gap-1.5 px-2 sm:px-3 py-2 text-sm font-semibold rounded-md transition-colors shrink-0 ${
            isPreviewMode
              ? 'bg-white text-[var(--primary-color)] hover:bg-gray-100'
              : 'bg-[var(--secondary-color)] text-white hover:bg-[var(--button-hover-color-out)]'
          }`}
        >
          {isPreviewMode ? (
            <>
              <X size={18} className='shrink-0' />
              <span className='hidden sm:inline'>Exit Preview</span>
            </>
          ) : (
            <>
              <Eye size={18} className='shrink-0' />
              <span className='hidden sm:inline'>Quick Preview</span>
            </>
          )}
        </button>

        {!isPreviewMode && (
          <>
            <button
              type='button'
              onClick={undo}
              disabled={undoStack.length <= 1}
              aria-label='Undo'
              className='flex items-center gap-1 p-2 text-white rounded-md hover:bg-[var(--button-hover-color-out)] disabled:opacity-40 disabled:cursor-not-allowed'
            >
              <Undo2 size={20} />
            </button>

            <button
              type='button'
              onClick={redo}
              disabled={redoStack.length === 0}
              aria-label='Redo'
              className='flex items-center gap-1 p-2 text-white rounded-md hover:bg-[var(--button-hover-color-out)] disabled:opacity-40 disabled:cursor-not-allowed'
            >
              <Redo2 size={20} />
            </button>

            <button
              type='button'
              aria-label={isSaving ? 'Saving design' : 'Save design'}
              className='flex items-center gap-1 p-2 text-white text-sm md:text-base font-medium rounded-md transition-colors hover:text-[var(--primary-color)] hover:bg-[var(--button-hover-color-out)] disabled:opacity-60'
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoaderCircle className='animate-spin' size={20} />
                  <span className='hidden sm:inline'>Saving...</span>
                </>
              ) : (
                <>
                  <SaveIcon size={20} />
                  <span className='hidden sm:inline'>Save Design</span>
                </>
              )}
            </button>

            {/* batch export pdf */}
            <ExportToPNGandPDF designId={id} />
          </>
        )}
      </div>    </div>
  );
};

export default DesignEditorNavbar;
