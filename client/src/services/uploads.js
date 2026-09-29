import axios from 'axios';
import { getToken } from '../supabase/authHelper';

const baseUrl = '/api/uploads';

// Fetch a single upload by its ID
const getById = async (uploadId) => {
  const token = await getToken(); // Get Supabase auth token
  const response = await axios.get(`${baseUrl}/${uploadId}`, {
    headers: {
      Authorization: `Bearer ${token}`, // Send token in Authorization header
    },
  });
  return response.data; // Return upload data
};

// Upload a new file using FormData
const create = async (formData) => {
  const token = await getToken();
  const response = await axios.post(baseUrl, formData, {
    headers: {
      Authorization: `Bearer ${token}`, // Auth token
      'Content-Type': 'multipart/form-data', // Indicate file upload
    },
  });
  return response.data; // Return created upload info
};

// Delete an upload by ID
const remove = async (uploadId) => {
  const token = await getToken();
  const response = await axios.delete(`${baseUrl}/${uploadId}`, {
    headers: { Authorization: `Bearer ${token}` }, // Auth token
  });
  return response.data; // Return deletion result
};

export default { getById, create, remove };
