const fs = require('fs');
const csv = require('csv-parser');
const supabaseAdmin = require('../supabase-admin');

// GET /api/uploads/:uploadId
const getUpload = async (req, res) => {
  const userId = req.user.id;
  const { uploadId } = req.params;

  try {
    const { data: upload, error } = await supabaseAdmin
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!upload) {
      return res
        .status(404)
        .json({ error: `Upload with ID ${uploadId} is not found` });
    }

    // rows/columns are stored as JSON text columns, so parse them back
    const rows = upload.rows ? JSON.parse(upload.rows) : [];
    const columns = upload.columns ? JSON.parse(upload.columns) : [];

    res.json({
      id: upload.id,
      fileName: upload.fileName,
      createdAt: upload.createdAt,
      rowCount: upload.rowCount,
      rows,
      columns,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch upload' });
  }
};

// POST /api/uploads
const createUpload = async (req, res) => {
  const userId = req.user.id;

  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = req.file.path;

  try {
    // Parse the CSV — no more "batches" concept needed here. That existed
    // just gets one insert with the full rows array as JSON.
    const rows = [];
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream) {
      rows.push(row);
    }

    const rowCount = rows.length;
    const columns = rowCount > 0 ? Object.keys(rows[0]) : [];

    const { data: upload, error } = await supabaseAdmin
      .from('uploads')
      .insert({
        user_id: userId,
        fileName: req.file.originalname,
        rowCount,
        columns: JSON.stringify(columns),
        rows: JSON.stringify(rows),
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: upload.id,
      fileName: upload.fileName,
      createdAt: upload.createdAt,
      rowCount,
      rows,
      columns,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ error: 'Failed to parse or save CSV' });
  } finally {
    fs.unlink(filePath, () => {}); // cleanup temp file
  }
};

// DELETE /api/uploads/:uploadId
const deleteUpload = async (req, res) => {
  const userId = req.user.id;
  const { uploadId } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('uploads')
      .delete()
      .eq('id', uploadId)
      .eq('user_id', userId); // ownership check

    if (error) throw error;

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete upload' });
  }
};

module.exports = {
  getUpload,
  createUpload,
  deleteUpload,
};
