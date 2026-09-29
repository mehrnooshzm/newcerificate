const supabaseAdmin = require('../supabase-admin');

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    console.log('getUser result:', { user, error });

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('getUser exception:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticateUser;

module.exports = authenticateUser;
