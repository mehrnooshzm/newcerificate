const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const verifyFirebasePassword = require('../migrationData/firebaseVerify');

// Supabase Admin
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Load Firebase exported users
const firebaseUsers = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../migrationData/users.json'), 'utf8')
);
// Controller function to handle user signup
const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    // Create a new user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullname },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: 'Signup successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.user_metadata?.full_name,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const migratePassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Migration request:', email);

    // 1. Find Firebase user
    const firebaseUser = firebaseUsers.find((user) => user.email === email);

    if (!firebaseUser) {
      return res.status(404).json({
        success: false,
        error: 'user not found',
      });
    }

    // 2. Verify Firebase password
    const valid = await verifyFirebasePassword(password, firebaseUser);
    console.log('Password length:', password.length);
    console.log('Password:', JSON.stringify(password));
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: 'Wrong password',
      });
    }

    console.log('Firebase password verified');

    // 3. Find Supabase user mapping
    const { data: mapping, error: mappingError } = await supabaseAdmin
      .from('firebase_user_mapping')
      .select('supabase_user_id')
      .eq('firebase_uid', firebaseUser.uid)
      .maybeSingle();

    console.log('Mapping result:', {
      firebaseUid: firebaseUser.uid,
      mapping,
      mappingError,
    });

    if (!mapping) {
      return res.status(404).json({
        success: false,
        error: 'Supabase user mapping not found',
      });
    }

    // 4. Update Supabase password
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(mapping.supabase_user_id, {
        password,
      });

    if (updateError) {
      throw updateError;
    }

    return res.json({
      success: true,
      message: 'Password migrated successfully',
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { signup, migratePassword }; // Export the signup function
