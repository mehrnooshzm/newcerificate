import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useCSVDataContext } from '@/hooks/useCSVDataContext';
import { createDynamicFieldGroup } from '@/utils/canvasFields';
import uploadService from '@/services/uploads';
import StatusMessage from '@/components/reusable/StatusMessage';
import ConfirmationDialog from '@/components/reusable/ConfirmationDialog';
import CustomSelect from '@/components/reusable/CustomSelect';

const HorizontalLine = () => <hr className='bg-gray-600 my-4' />;

const CSVUpload = () => {
  // Local state for status messages, dialog visibility, pending file, and loading
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showDialog, setShowDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Canvas and CSV contexts , bulk export pdf
  const { canvasEditor, showCaptions, setShowCaptions, size, orientation } =
    useCanvasContext();
  const {
    CSVData,
    setCSVData,
    previewRowIndex,
    setPreviewRowIndex,
    selectedRecords,
    setSelectedRecords,
  } = useCSVDataContext();
  const { id } = useParams(); // undefined when the URL is `/designs/new`

  const fileName = CSVData?.fileName || '';
  const rows = CSVData?.rows || [];
  const columns = CSVData?.columns || [];

  // If the path is not "new", look up design in redux
  const design = useSelector(({ designs }) =>
    id ? designs.find((design) => design.id === id) : null
  );

  useEffect(() => {
    const fetchCSVData = async () => {
      // No design or no csvUploadId -> nothing to fetch
      if (!design?.csvUploadId) return;

      try {
        if (!CSVData) {
          const data = await uploadService.getById(design.csvUploadId);
          setCSVData(data);
          setPreviewRowIndex(design.csvRowIndex);
        }
      } catch (error) {
        console.error('Failed to fetch CSV data:', error);
      }
    };

    fetchCSVData();

    if (design?.showCaptions != null) {
      setShowCaptions(design.showCaptions);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design, setCSVData]);

  // Upload a new CSV file
  const handleFileUpload = async (file) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadData = await uploadService.create(formData);
      setCSVData(uploadData);

      setStatus({
        type: 'success',
        message: `File uploaded (${uploadData.rowCount} rows)`,
      });
    } catch (error) {
      setStatus({ type: 'failure', message: 'Failed to upload a file' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection from input
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so selecting the same file again will still trigger onChange
    e.target.value = null;

    if (CSVData) {
      // If already have a file, ask for confirmation to replace it
      setPendingFile(file);
      setShowDialog(true);
    } else {
      // If no file was previously uploaded, upload immediately
      handleFileUpload(file);
    }
  };

  const confirmReplaceFile = async () => {
    if (!pendingFile) return;

    try {
      // Delete old file in DB
      if (CSVData?.id) {
        await uploadService.remove(CSVData.id);
      }

      // Remove dynamic fields from canvas
      if (canvasEditor) {
        const objectsToRemove = canvasEditor
          .getObjects()
          .filter((obj) => obj.type === 'custom-group' && obj.metadata?.field);
        objectsToRemove.forEach((obj) => canvasEditor.remove(obj));
        canvasEditor.requestRenderAll();
      }

      // Clear old CSVData state
      setCSVData(null);
      setPreviewRowIndex(null);
      //bulk export pdf - checkbox
      setSelectedRecords([]);

      // Upload new file
      await handleFileUpload(pendingFile);
    } catch (err) {
      console.error('Failed to replace file:', err);
      setStatus({ type: 'failure', message: 'Failed to replace file' });
    } finally {
      setPendingFile(null);
      setShowDialog(false);
    }
  };

  const cancelReplaceFile = () => {
    setPendingFile(null);
    setShowDialog(false);
  };

  // Add a dynamic field to canvas
  const hanldeAddField = (columnName) => {
    if (!canvasEditor) return;

    const activeObject = canvasEditor.getActiveObject();

    const text =
      previewRowIndex !== null && rows[previewRowIndex]
        ? rows[previewRowIndex][columnName] || '{{}}'
        : `{{${columnName}}}`;

    if (
      activeObject &&
      activeObject.type === 'i-text' &&
      !activeObject.isDynamicFieldText
    ) {
      // Replace selected text with a dynamic field group
      canvasEditor.remove(activeObject);

      const group = createDynamicFieldGroup(columnName, text, activeObject);

      canvasEditor.add(group);
      canvasEditor.setActiveObject(group);
    } else if (
      activeObject &&
      activeObject.type === 'custom-group' &&
      activeObject.metadata?.field
    ) {
      // Rebind existing dynamic field group to a new column
      const [caption, fieldText] = activeObject.getObjects();

      caption.set({ text: columnName });
      fieldText.set({ text });

      activeObject.set({ metadata: { field: columnName } });
    } else {
      // Create a new group
      const group = createDynamicFieldGroup(columnName, text);

      canvasEditor.add(group);
      canvasEditor.setActiveObject(group);
    }

    canvasEditor.renderAll();
  };

  // Update canvas preview based on selected CSV row
  const hanldeUpdatePreview = (rowIndex) => {
    if (!canvasEditor) return;

    setPreviewRowIndex(rowIndex);

    canvasEditor.getObjects().forEach((obj) => {
      if (obj.type === 'custom-group' && obj.metadata?.field) {
        const columnName = obj.metadata.field;
        const dynamicFieldText = obj
          .getObjects()
          .find((obj) => obj.isDynamicFieldText);

        if (!dynamicFieldText) return;

        const newText =
          rowIndex !== null && rows[rowIndex]
            ? rows[rowIndex][columnName] || '{{}}'
            : `{{${columnName}}}`;

        if (dynamicFieldText.text === newText) return;

        dynamicFieldText.set('text', newText);

        dynamicFieldText.initDimensions();
        dynamicFieldText.set('dirty', true);
        obj.set('dirty', true);
        obj.setCoords();
      }
    });

    canvasEditor.requestRenderAll();
  };

  // Toggle visibility of captions on canvas
  const hanldeToggleCaptionsVisibility = () => {
    setShowCaptions((prev) => !prev);

    if (!canvasEditor) return;

    canvasEditor.getObjects().forEach((obj) => {
      if (obj.type === 'custom-group') {
        const caption = obj
          .getObjects()
          .find((child) => child.type === 'i-text');

        if (caption) {
          caption.visible = !showCaptions; // toggle visibility
        }
      }
    });

    canvasEditor.requestRenderAll();
  };

  return (
    <div className='flex flex-col gap-6 '>
      <HorizontalLine />
      <h3 className='text-md font-semibold text-white hover:opacity-80 hover:cursor-pointer'>
        Data Import
      </h3>
      <p className='text-xs text-white'>
        Upload a CSV file to automatically fill in certificate details (names,
        titles, dates, and more)
      </p>
      {/* File upload / replace button */}
      <label className='flex flex-col items-start gap-2 cursor-pointer'>
        <span className='w-1/2 px-3 py-1 bg-[var(--button-hover-color-on)] rounded font-medium text-xs text-center text-white hover:text-[var(--primary-color)] hover:bg-[var(--button-hover-color-out)]'>
          {isLoading ? (
            <LoaderCircle className='animate-spin ' />
          ) : CSVData ? (
            'Replace File'
          ) : (
            'Upload file'
          )}
        </span>
        <input
          type='file'
          accept='.csv'
          onChange={handleFileSelect}
          className='hidden'
        />
        <span className='text-xs text-neutral-300'>{fileName}</span>
      </label>

      {/* Confirmation dialog for replacing file */}
      {showDialog && (
        <ConfirmationDialog
          open={showDialog}
          setOpen={setShowDialog}
          dialogTitle='Replace CSV file'
          dialogText='Are you sure you want to replace the previous CSV file? This will remove all existing dynamic fields from the certificate. This action cannot be undone.'
          confirmButtonText='Replace file'
          onConfirm={confirmReplaceFile}
          onCancel={cancelReplaceFile}
        />
      )}

      {/* Status messages */}
      <StatusMessage
        type={status.type}
        message={status.message}
        className='flex gap-[10px] text-[0.75rem]'
      />
      {/* Buttons to add dynamic fields */}
      {columns.length > 0 && (
        <div>
          <span className='block text-center mb-3 text-xs text-gray-300'>
            Add dynamic fields:
          </span>
          <div className='flex flex-col items-start gap-[10px]'>
            {columns
              .slice()
              .sort()
              .map((col) => (
                <button
                  key={col}
                  className='w-full px-3 py-1 rounded bg-[#B3B3B3] hover:bg-[var(--button-hover-color-on)] text-xs text-white'
                  onClick={() => hanldeAddField(col)}
                >
                  {col}
                </button>
              ))}
          </div>
        </div>
      )}
      {/* Preview row selection */}
      {rows.length > 0 && (
        <div>
          <div>
            <span className='text-sm block mb-1'>Preview with:</span>
            {/* bulk export pdf - checkbox*/}
            <CustomSelect
              options={[
                'Placeholders',
                ...rows.map((_, index) => `Record ${index + 1}`),
              ]}
              value={
                previewRowIndex === null
                  ? 'Placeholders'
                  : `Record ${previewRowIndex + 1}`
              }
              onChange={(value) =>
                hanldeUpdatePreview(
                  value === 'Placeholders'
                    ? null
                    : Number(value.split(' ')[1]) - 1
                )
              }
              multiple={true}
              selectedValues={selectedRecords}
              onMultiChange={setSelectedRecords}
            />
          </div>
        </div>
      )}

      {/* Toggle caption visibility button */}
      {rows.length > 0 && (
        <button
          className='w-full px-3 py-1 rounded bg-[#B3B3B3] hover:bg-[var(--button-hover-color-on)] text-white text-[0.82rem] hover:cursor-pointer'
          onClick={hanldeToggleCaptionsVisibility}
        >
          {showCaptions ? 'Hide captions' : 'Show captions'}
        </button>
      )}
    </div>
  );
};

export default CSVUpload;
