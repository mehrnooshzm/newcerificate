import axios from 'axios';
import { getToken } from '../supabase/authHelper';

const baseUrl = '/api/templates';

// Fetch all templates from the server
const getAll = async () => {
  const token = await getToken(); // Get Supabase auth token

  const response = await axios.get(baseUrl, {
    headers: { Authorization: `Bearer ${token}` }, // Send token in Authorization header
  });
  return response.data; // Return the list of templates
};

export default { getAll };
