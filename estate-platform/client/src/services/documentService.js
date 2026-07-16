import api from './api';

export const getAllDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const getMyDocuments = async () => {
  const response = await api.get('/documents/my-documents');
  return response.data;
};

export const uploadDocument = async (formData) => {
  const response = await api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};