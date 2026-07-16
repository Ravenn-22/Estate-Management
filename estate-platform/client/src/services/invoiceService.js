import api from './api';

export const getInvoices = async () => {
  const response = await api.get('/invoices');
  return response.data;
};

export const getMyInvoices = async () => {
  const response = await api.get('/invoices/my-invoices');
  return response.data;
};

export const createInvoice = async (data) => {
  const response = await api.post('/invoices', data);
  return response.data;
};