const supabaseAdmin = require('../supabase-admin');

// GET /api/templates
const getAllTemplates = async (_, res) => {
  try {
    const { data: templates, error } = await supabaseAdmin
      .from('templates')
      .select('*');

    if (error) throw error;

    // Supabase returns an empty array (not null) when there's no data,

    if (!templates) return res.json([]);

    res.json(templates); // Send templates as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
};

module.exports = {
  getAllTemplates, // Export function
};
