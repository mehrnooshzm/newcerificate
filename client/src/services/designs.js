import axios from 'axios';
import { getToken } from '../supabase/authHelper';

const baseUrl = '/api/designs';

// Fetch all designs from the server
const getAll = async () => {
  const token = await getToken();
  const response = await axios.get(baseUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch a single design by its ID
const getById = async (designId) => {
  const token = await getToken();
  const response = await axios.get(`${baseUrl}/${designId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update an existing design by ID
const update = async (designId, data) => {
  const token = await getToken();
  const response = await axios.put(`${baseUrl}/${designId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Create a new design
const create = async (data) => {
  const token = await getToken();
  const response = await axios.post(baseUrl, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Delete a design by ID
const remove = async (designId) => {
  const token = await getToken();
  const response = await axios.delete(`${baseUrl}/${designId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default { getAll, getById, update, create, remove };
