const supabaseAdmin = require('../supabase-admin');

// GET /api/designs
// Returns all designs belonging to the authenticated user
const getAllDesigns = async (req, res) => {
  const uid = req.user.id;

  try {
    const { data: designs, error } = await supabaseAdmin
      .from('designs')
      .select('*')
      .eq('user_id', uid)
      .order('createdAt', { ascending: false });

    if (error) throw error;
res.setHeader('X-Data-Source', 'supabase');
    // Supabase returns [] when there is no data, but guard just in case
    res.json(designs ?? []);
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ error: 'Failed to get designs' });
  }
};

// GET /api/designs/:designId
const getDesign = async (req, res) => {
  const uid = req.user.id;
  const { designId } = req.params;

  try {
    const { data: design, error } = await supabaseAdmin
      .from('designs')
      .select('*')
      .eq('id', designId)
      .eq('user_id', uid)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

    if (!design) {
      return res
        .status(404)
        .json({ error: `Design with ID ${designId} is not found` });
    }
   res.setHeader('X-Data-Source', 'supabase');
    res.json(design);
  } catch (error) {
    console.error('Error fetching design:', error);
    res.status(500).json({ error: 'Failed to fetch design' });
  }
};

// POST /api/designs
const createDesign = async (req, res) => {
  const uid = req.user.id;

  try {
    const newDesign = {
      ...req.body,
      user_id: uid,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('designs')
      .insert(newDesign)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error saving design:', error);
    res.status(500).json({ error: 'Failed to save design' });
  }
};

// PUT /api/designs/:designId
const updateDesign = async (req, res) => {
  const uid = req.user.id;
  const { designId } = req.params;

  try {
    const updatedDesign = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('designs')
      .update(updatedDesign)
      .eq('id', designId)
      .eq('user_id', uid)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return res
        .status(404)
        .json({ error: `Design with ID ${designId} is not found` });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating design:', error);
    res.status(500).json({ error: 'Failed to update design' });
  }
};

// DELETE /api/designs/:designId
const deleteDesign = async (req, res) => {
  const uid = req.user.id;
  const { designId } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('designs')
      .delete()
      .eq('id', designId)
      .eq('user_id', uid);

    if (error) throw error;

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ error: 'Failed to delete design' });
  }
};

module.exports = {
  getAllDesigns,
  getDesign,
  createDesign,
  updateDesign,
  deleteDesign,
};
