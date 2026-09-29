import { PDFDocument } from 'pdf-lib';
import { pageSizes } from './canvasSettings';

export const exportCertificateToPNG = (canvas) => {
  if (!canvas) return;

  // Export at double resolution
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1.0,
    multiplier: 2, // High resolution export
  });

  // Download image
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `design-${Date.now()}.png`;
  link.click();
};

//bulk download pdf
// Export the Fabric.js canvas as a PDF
export const exportCertificateToPDF = async (
  canvas,
  pageSize,
  orientation,
  options = {}
) => {
  if (!canvas) return null;

  const {
    download = true,
    fileName = `design-${Date.now()}.pdf`,
    customDimensions = null, // { width, height } — required when pageSize === 'custom'
  } = options;

  try {
    const pdfDoc = await PDFDocument.create();

    let width, height;

    if (pageSize === 'custom') {
      if (!customDimensions?.width || !customDimensions?.height) {
        console.error(
          'exportCertificateToPDF: custom size requires customDimensions { width, height }'
        );
        return null;
      }
      ({ width, height } = customDimensions);
    } else {
      if (!pageSizes[pageSize] || !pageSizes[pageSize][orientation]) {
        console.error(
          'exportCertificateToPDF: invalid pageSize/orientation',
          pageSize,
          orientation
        );
        return null;
      }
      ({ width, height } = pageSizes[pageSize][orientation]);
    }

    // Export canvas as high-res PNG
    const pngDataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 2,
    });

    const pngImageBytes = await fetch(pngDataUrl).then((res) =>
      res.arrayBuffer()
    );

    const canvasImg = await pdfDoc.embedPng(pngImageBytes);

    // Maintain aspect ratio
    const imgWidth = canvasImg.width;
    const imgHeight = canvasImg.height;

    let drawWidth = width;
    let drawHeight = (imgHeight * width) / imgWidth;

    if (drawHeight > height) {
      drawHeight = height;
      drawWidth = (imgWidth * height) / imgHeight;
    }

    // Add page and draw image
    const page = pdfDoc.addPage([width, height]);

    page.drawImage(canvasImg, {
      x: 0,
      y: 0,
      width: drawWidth,
      height: drawHeight,
    });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], {
      type: 'application/pdf',
    });

    // Existing behavior: download PDF
    if (download) {
      const link = document.createElement('a');

      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();

      URL.revokeObjectURL(link.href);
    }

    // New behavior: return Blob for batch export
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
};
