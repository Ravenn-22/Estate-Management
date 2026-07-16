import api from './api';

export const signup = async (data) => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getTenants = async () => {
  const response = await api.get('/auth/tenants');
  return response.data;
};