import axios from 'axios';

const baseUrl = '/api/auth/migrate-password';

const migratePassword = async (email, password) => {
  const response = await axios.post(baseUrl, {
    email,
    password,
  });
  return response;
};

export default migratePassword;
