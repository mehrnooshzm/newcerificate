import { Download, FileImage, FileText } from 'lucide-react';

import { useState } from 'react';
import { useCanvasContext } from '@/hooks/useCanvasContext';
import { useCSVDataContext } from '@/hooks/useCSVDataContext';
import {
  exportCertificateToPNG,
  exportCertificateToPDF,
} from '@/utils/exportCertificate';
import withHiddenCaptions from '@/utils/withHiddenCaptions';
//import context for email
import { useAuthContext } from '@/hooks/useAuthContext';
import emailjs from '@emailjs/browser';

const baseUrl = '/api/certificates/batch-export';
//email variables from env file
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const ExportToPNGandPDF = ({ designId }) => {
  // Get the currently logged-in user's information for bulk export email delivery
  const { currentUser } = useAuthContext();
  const { canvasEditor, size, orientation, customWidth, customHeight } =
    useCanvasContext();

  const { CSVData, selectedRecords } = useCSVDataContext();

  //progress tracker
  const [exportProgress, setExportProgress] = useState({
    visible: false,
    progress: 0,
    completed: 0,
    total: 0,
  });

  // model pop up copy link button state
  const [linkCopied, setLinkCopied] = useState(false);

  // modal popup information for batch pdf generation
  const [exportSuccess, setExportSuccess] = useState({
  visible: false,
  downloadUrl: '',
  certificateCount: 0,
  emailSuccess: false,
  emailError: '',
  });
  const rows = CSVData?.rows || [];

  // Helper: build customDimensions param only when size is "custom"
  const getCustomDimensions = () =>
    size === 'custom' ? { width: customWidth, height: customHeight } : null;

  // pdf file name generation
  const possibleNameColumns = [
    'name',
    'full name',
    'firstname',
    'first name',
    'student name',
    'employee name',
  ];

  const getCertificateFileName = (rowIndex) => {
    const row = rows[rowIndex];
    if (!row) {
      return `certificate-record-${rowIndex + 1}.pdf`;
    }
    const nameColumn = Object.keys(row).find((column) =>
      possibleNameColumns.includes(column.trim().toLowerCase())
    );
    const name = nameColumn ? row[nameColumn]?.trim() : '';
    if (name) {
      return `certificate-${name}.pdf`;
    }
    return `certificate-record-${rowIndex + 1}.pdf`;
  };

  // Export certificate as PNG
  const handleExportToPNG = async () => {
    if (!canvasEditor) return;

    await withHiddenCaptions(canvasEditor, async () => {
      exportCertificateToPNG(canvasEditor);
    });
  };

  // Update canvas with data for a specific CSV row
  const updateCanvasForRow = (rowIndex) => {
    if (!canvasEditor || !rows[rowIndex]) return;

    canvasEditor.getObjects().forEach((obj) => {
      if (obj.type !== 'custom-group' || !obj.metadata?.field) {
        return;
      }

      const columnName = obj.metadata.field;

      const dynamicFieldText = obj
        .getObjects()
        .find((child) => child.isDynamicFieldText);

      if (!dynamicFieldText) return;

      const newText = rows[rowIndex][columnName] || '{{}}';

      dynamicFieldText.set('text', newText);
      dynamicFieldText.initDimensions();
      dynamicFieldText.set('dirty', true);

      obj.set('dirty', true);
      obj.setCoords();
    });
  };

  // Export certificate as PDF
  const handleExportToPDF = async () => {
    if (!canvasEditor) return;

    // snapshot to restore canvas after batch export
    let originalCanvasState = null;

    const restoreCanvas = () => {
      if (!originalCanvasState) return;
      canvasEditor.loadFromJSON(originalCanvasState, () => {
        canvasEditor.requestRenderAll();
      });
    };

    try {
      // original pdf button behaviour when no records are selected
      if (selectedRecords.length === 0) {
        await withHiddenCaptions(canvasEditor, async () => {
          await exportCertificateToPDF(canvasEditor, size, orientation, {
            customDimensions: getCustomDimensions(),
          });
        });

        return;
      }

      // convert selected records to row indexes
      const rowIndexes = selectedRecords
        .map((record) => Number(record.split(' ')[1]) - 1)
        .filter((index) => index >= 0 && index < rows.length);

      if (rowIndexes.length === 0) {
        alert('No valid records selected.');
        return;
      }

      // one record
      if (rowIndexes.length === 1) {
        const rowIndex = rowIndexes[0];

        // snapshot before mutating canvas, restore after export
        originalCanvasState = canvasEditor.toJSON();

        updateCanvasForRow(rowIndex);

        await withHiddenCaptions(canvasEditor, async () => {
          await exportCertificateToPDF(canvasEditor, size, orientation, {
            download: true,
            fileName: getCertificateFileName(rowIndex),
            customDimensions: getCustomDimensions(),
          });
        });

        restoreCanvas();

        return;
      }

      // multiple records

      // A saved design is required because the backend batch-export uses designId
      if (!designId) {
        alert('Please save the design before exporting multiple certificates.');
        return;
      }

      //progress tracker
      setExportProgress({
        visible: true,
        progress: 0,
        completed: 0,
        total: rowIndexes.length,
      });

      const pdfFiles = [];

      // snapshot canvas before we start overwriting it row by row
      originalCanvasState = canvasEditor.toJSON();

      // Generate each PDF without downloading
      await withHiddenCaptions(canvasEditor, async () => {
        for (const [index, rowIndex] of rowIndexes.entries()) {
          updateCanvasForRow(rowIndex);
          await new Promise((resolve) => requestAnimationFrame(resolve));
          const fileName = getCertificateFileName(rowIndex);
          const pdfBlob = await exportCertificateToPDF(
            canvasEditor,
            size,
            orientation,
            {
              download: false,
              fileName,
              customDimensions: getCustomDimensions(),
            }
          );

          if (pdfBlob) {
            pdfFiles.push({
              blob: pdfBlob,
              fileName,
            });

            const completed = index + 1;
            const progress = Math.round((completed / rowIndexes.length) * 100);

            setExportProgress({
              visible: true,
              progress,
              completed,
              total: rowIndexes.length,
            });
          }
        }
      });

      if (pdfFiles.length === 0) {
        throw new Error('No PDF files were generated.');
      }
      
      const formData = new FormData();
      formData.append('designId', designId);
      formData.append('rowIndexes', JSON.stringify(rowIndexes));

      pdfFiles.forEach((pdf) => {
        formData.append('files', pdf.blob, pdf.fileName);
      });

      const response = await fetch(baseUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.jobId) {
        throw new Error(data.message || 'Failed to create batch export job');
      }

      const jobId = data.jobId;

      // canvas was modified during export, restore it to its original state
      restoreCanvas();

      // poll job status
      const pollJob = async () => {
        const statusResponse = await fetch(`${baseUrl}/${jobId}`);
        const statusData = await statusResponse.json();
        // progress tracker start
        const backendProgress = statusData.progress || 0;
        const backendCompleted = statusData.completed || 0;
        const total = statusData.total || rowIndexes.length;

        // Keep progress from moving backwards
        setExportProgress((prev) => ({
          visible: true,
          progress: Math.max(prev.progress, backendProgress),
          completed: Math.max(prev.completed, backendCompleted),
          total,
        }));
        // progress tracker end

        if (!statusResponse.ok || !statusData.success) {
          throw new Error(
            statusData.message || 'Failed to get batch export status'
          );
        }
        
      if (statusData.status === 'completed') {
          // Hide progress tracker
          setExportProgress((prev) => ({
            ...prev,
            visible: false,
          }));

        const downloadUrl = statusData.downloadUrl;

        if (!downloadUrl) {
          throw new Error('Download URL was not generated.');
        }

        // download zip first
        const downloadResponse = await fetch(downloadUrl);

        if (!downloadResponse.ok) {
          throw new Error('Failed to download the ZIP file.');
        }

        const downloadBlob = await downloadResponse.blob();

        const link = document.createElement('a');
        const blobUrl = window.URL.createObjectURL(downloadBlob);

        link.href = blobUrl;
        link.download = `certificates-${jobId}.zip`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);

        //send email using EMAILJS
        let emailSuccess = false;
        let emailError = '';

        try {
           if (
            !EMAILJS_SERVICE_ID ||
            !EMAILJS_TEMPLATE_ID ||
            !EMAILJS_PUBLIC_KEY
          ) {
            throw new Error('Email service is not configured.');
          }
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
              to_name: currentUser.email,
                  to_email: currentUser.email,
                  certificate_count: rowIndexes.length,
                  download_url: downloadUrl,
            },
                EMAILJS_PUBLIC_KEY
            );
              emailSuccess = true;
              console.log('EmailJS email sent successfully.');
        } 
        catch (error) {
          console.error('EmailJS email failed:', error);
          emailSuccess = false;
          emailError =
            error?.text ||
            error?.message ||
            'The email could not be sent.';
        }

      //show popup
      setExportSuccess({
        visible: true,
        downloadUrl: downloadUrl,
        certificateCount: rowIndexes.length,
        emailSuccess,
        emailError,
      });

      return;
    }

    // export failed
    if (statusData.status === 'failed') {
      //progress tracker
      setExportProgress((prev) => ({
        ...prev,
        visible: false,
      }));
      throw new Error(statusData.error || 'Batch export failed');
    }

        //still processing
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return pollJob();
      };

      await pollJob();
    } catch (error) {
      // restore canvas even if export failed midway
      restoreCanvas();
      // progress tracker
      setExportProgress((prev) => ({
        ...prev,
        visible: false,
      }));
      console.error('Export failed:', error);

      alert(error.message || 'Failed to export certificates.');
    }
  };

  return (
    <div className='relative flex gap-1 sm:gap-2'>
      {/* PNG Export Button */}
      <button
        type='button'
        aria-label='Export as PNG'
        onClick={handleExportToPNG}
        className='flex items-center gap-2 px-2 sm:px-3 py-2 text-sm font-medium rounded-md text-white bg-[var(--secondary-color)] transition-colors hover:bg-[var(--button-hover-color-out)] hover:text-[var(--primary-color)]'
      >
        <FileImage className='h-4 w-4 shrink-0' />
        <span className='hidden sm:inline'>PNG</span>
      </button>

      <button
        type='button'
        aria-label='Export as PDF'
        onClick={handleExportToPDF}
        disabled={exportProgress.visible}
        className='flex items-center gap-2 px-2 sm:px-3 py-2 text-sm font-medium rounded-md text-white bg-[var(--secondary-color)] transition-colors hover:bg-[var(--button-hover-color-out)] hover:text-[var(--primary-color)] disabled:cursor-not-allowed disabled:opacity-50'
      >
        <FileText className='h-4 w-4 shrink-0' />
        <span className='hidden sm:inline'> {selectedRecords.length > 1 ? 'PDF ZIP' : 'PDF'}</span>
      </button>

      {/* Progress card */}
      {exportProgress.visible && (
        <div className='absolute right-0 top-full z-50 mt-2 w-[280px] rounded-md border bg-white p-3 shadow-lg'>
          <div className='mb-2 flex items-center justify-between text-sm font-medium text-gray-700'>
            <span className='flex items-center gap-1'>
              Processing certificates
            </span>
            <span>
              {exportProgress.completed} / {exportProgress.total}
            </span>
          </div>

          <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
            <div
              className='h-full rounded-full bg-[var(--secondary-color)] transition-all duration-300'
              style={{
                width: `${exportProgress.progress}%`,
              }}
            />
          </div>

          <div className='mt-1 text-right text-xs text-gray-500'>
            {exportProgress.progress}%
          </div>
        </div>
      )}

      {/* Success popup after pdf batch export*/}
      {exportSuccess.visible && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40'>
          <div className='w-[90%] max-w-md rounded-lg bg-white p-6 shadow-xl'>
            <div className='text-center'>
              <div className='mb-3 text-4xl'>✓</div>

              <h2 className='text-xl font-semibold text-gray-800'>
                Certificates Generated Successfully
              </h2>

              <p className='mt-3 text-sm text-gray-600'>
                Your{' '}
                <strong>{exportSuccess.certificateCount} certificates</strong>{' '}
                have been generated successfully.
              </p>

              {exportSuccess.emailSuccess ? (
                <p className='mt-2 text-sm text-gray-600'>
                  A download link has also been sent to your email.
                  <br />
                  Kindly check your spam/junk folder.
                </p>
              ) : (
                <p className='mt-2 text-sm text-red-600'>
                  The email could not be sent.
                  {exportSuccess.emailError && (
                    <>
                      <br />
                      {exportSuccess.emailError}
                    </>
                  )}
                </p>
              )}
            </div>

            <div className='mt-5 flex gap-2'>
              <button
                type='button'
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      exportSuccess.downloadUrl
                    );

                    setLinkCopied(true);

                    setTimeout(() => {
                      setLinkCopied(false);
                    }, 2000);
                  } catch (error) {
                    console.error('Failed to copy download link:', error);
                  }
                }}
                className='flex-1 rounded-md bg-[var(--secondary-color)] px-4 py-2 text-sm font-medium text-white transition-all'
              >
                {linkCopied ? '✓ Copied' : 'Copy Link'}
              </button>

              <button
                type='button'
                onClick={() =>
                  setExportSuccess({
                    visible: false,
                    downloadUrl: '',
                    certificateCount: 0,
                    emailSuccess: false,
                    emailError: '',
                  })
                }
                className='flex-1 rounded-md border px-4 py-2 text-sm font-medium text-gray-700'
              >
                Close
              </button>
            </div>

            <p className='mt-3 text-center text-xs text-gray-500'>
              The download link is valid for 7 days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportToPNGandPDF;
