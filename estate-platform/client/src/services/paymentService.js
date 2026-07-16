import api from './api';

export const recordPayment = async (data) => {
  const response = await api.post('/payments', data);
  return response.data;
};