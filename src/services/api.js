import axios from 'axios';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getList(path, params = {}) {
  const res = await api.get(path, { params });
  return res.data;
}

export async function getOne(path, id) {
  const res = await api.get(`${path}/${id}`);
  return res.data;
}

export async function createOne(path, payload) {
  const res = await api.post(path, payload);
  return res.data;
}

export async function updateOne(path, id, payload) {
  const res = await api.put(`${path}/${id}`, payload);
  return res.data;
}

export async function patchOne(path, id, payload) {
  const res = await api.patch(`${path}/${id}`, payload);
  return res.data;
}

export async function deleteOne(path, id) {
  await api.delete(`${path}/${id}`);
}

export default api;
