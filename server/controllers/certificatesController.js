const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { ZipArchive } = require('archiver');
// zip file storage in supabase
const supabaseAdmin = require('../supabase-admin'); 

const exportJobs = new Map();

// Clean up temporary batch export files from the server
const cleanupBatchExportFiles = (files, zipFilePath) => {
  try {
    // Delete uploaded PDF files
    files.forEach((file) => {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`Deleted temporary PDF: ${file.path}`);
      }
    });

    // Delete temporary ZIP file
    if (zipFilePath && fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
      console.log(`Deleted temporary ZIP: ${zipFilePath}`);
    }

    // Get the batch-exports folder path
    const exportDirectory = path.dirname(zipFilePath);

    // Delete the folder only if it is empty
    if (
      fs.existsSync(exportDirectory) && fs.readdirSync(exportDirectory).length === 0) 
    {
      fs.rmdirSync(exportDirectory);
      console.log(`Deleted empty folder: ${exportDirectory}`);
    }

    console.log('Temporary batch export files cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
};

const createBatchExport = async (req, res) => {
  try {
    const { designId } = req.body;
    let rowIndexes;

    try {
      rowIndexes = JSON.parse(req.body.rowIndexes || '[]');
    } 
    catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rowIndexes',
      });
    }

    if (!designId) {
      return res.status(400).json({
        success: false,
        message: 'designId is required',
      });
    }

    if (!Array.isArray(rowIndexes) || rowIndexes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one row must be selected',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one PDF file is required',
      });
    }

    const jobId = crypto.randomUUID();

    const exportDirectory = path.join(
      __dirname,
      '..',
      'uploads',
      'batch-exports'
    );

    fs.mkdirSync(exportDirectory, { recursive: true });

    const zipFileName = `certificates-${jobId}.zip`;
    const zipFilePath = path.join(exportDirectory, zipFileName);
    
    const job = {
      jobId,
      designId,
      rowIndexes,
      status: 'processing',
      progress: 0,
      completed: 0,
      total: req.files.length,
      error: null,
      downloadUrl: null,
      zipFilePath: null,
      createdAt: new Date(),
    };

    exportJobs.set(jobId, job);

    // Process ZIP asynchronously
    createZipFile(job, req.files, zipFilePath);

    return res.status(202).json({
      success: true,
      jobId,
      status: job.status,
      progress: job.progress,
      completed: job.completed,
      total: job.total,
    });
  } 
  catch (error) {
    console.error('Batch export creation failed:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack,
    });
  }
};

// zip file storage in supabase
const uploadZipToSupabase = async (job, zipFilePath) => {
  try {
    const bucketName = 'certificate-exports';

    const fileName = `certificates-${job.jobId}.zip`;

    const fileBuffer = fs.readFileSync(zipFilePath);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: 'application/zip',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log('ZIP uploaded to Supabase:', fileName);

    // Create a signed download URL valid for 7 days
    const { data: signedUrlData, error: signedUrlError } =
      await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUrl(
          fileName,
          60 * 60 * 24 * 7
        );

    if (signedUrlError) {
      throw signedUrlError;
    }

    job.downloadUrl = signedUrlData.signedUrl;

    console.log('Signed URL created successfully');

    return signedUrlData.signedUrl;
  } catch (error) {
    console.error('Supabase ZIP upload failed:', error);

    throw error;
  }
};


const createZipFile = (job, files, zipFilePath) => {
  const output = fs.createWriteStream(zipFilePath);
  const archive = new ZipArchive({
    zlib: { level: 9 },
  });


  output.on('close', async () => {
    try {
      job.zipFilePath = zipFilePath;

      console.log(
        `ZIP created: ${zipFilePath} (${archive.pointer()} total bytes)`
      );

      // Upload ZIP to Supabase
      await uploadZipToSupabase(job, zipFilePath);

      console.log('ZIP uploaded successfully');

      job.status = 'completed';
      job.progress = 100;
      job.completed = files.length;

      console.log('Batch export completed successfully');

      // The ZIP export is considered successful even if email fails.
      job.status = 'completed';
      job.progress = 100;
      job.completed = files.length;

      console.log(`Batch export completed. Email success: ${job.emailSuccess}`);
    } 
    catch (error) {
      console.error('Batch export processing failed:', error);
      job.status = 'failed';
      job.error = error.message;
    } 
    finally {
      // Always remove temporary files from the server
      cleanupBatchExportFiles(files, zipFilePath);
    }
});

  output.on('error', (error) => {
    console.error('ZIP output error:', error);
    job.status = 'failed';
    job.error = error.message;
  });

  archive.on('error', (error) => {
    console.error('Archive error:', error);

    job.status = 'failed';
    job.error = error.message;

    output.destroy();
  });

  archive.on('warning', (error) => {
    console.warn('Archive warning:', error);
  });

  archive.on('entry', () => {
    job.completed += 1;
    job.progress = Math.round((job.completed / files.length) * 100);
  });

  archive.pipe(output);

  files.forEach((file) => {
    archive.file(file.path, {
      name: file.originalname,
    });
  });

  archive.finalize();
};

const getBatchExportStatus = (req, res) => {
  const { jobId } = req.params;
  const job = exportJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Export job not found',
    });
  }

  return res.json({
    success: true,
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    completed: job.completed,
    total: job.total,
    error: job.error,
    downloadUrl: job.downloadUrl,
    // emailSuccess: job.emailSuccess,
    // emailError: job.emailError,
  });
};

const downloadBatchExport = (req, res) => {
  const { jobId } = req.params;
  const job = exportJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Export job not found',
    });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'ZIP file is not ready yet',
    });
  }

  if (!job.zipFilePath || !fs.existsSync(job.zipFilePath)) {
    return res.status(404).json({
      success: false,
      message: 'ZIP file not found',
    });
  }

  res.download(
    job.zipFilePath,
    `certificates-${jobId}.zip`,
    (error) => {
      if (error) {
        console.error('ZIP download failed:', error);
      }
    }
  );
};

module.exports = {
  createBatchExport,
  getBatchExportStatus,
  downloadBatchExport,
  exportJobs,
};