import api from './api';

export const getAllRequests = async () => {
  const response = await api.get('/maintenance');
  return response.data;
};

export const getMyRequests = async () => {
  const response = await api.get('/maintenance/my-requests');
  return response.data;
};

export const createRequest = async (formData) => {
  const response = await api.post('/maintenance', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateRequestStatus = async (id, status) => {
  const response = await api.patch(`/maintenance/${id}/status`, { status });
  return response.data;
};