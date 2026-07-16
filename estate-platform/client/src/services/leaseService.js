import api from './api';

export const getLeases = async () => {
  const response = await api.get('/leases');
  return response.data;
};

export const createLease = async (data) => {
  const response = await api.post('/leases', data);
  return response.data;
};

export const endLease = async (id) => {
  const response = await api.patch(`/leases/${id}/end`);
  return response.data;
};
export const getMyLease = async () => {
  const response = await api.get('/leases/my-lease');
  return response.data;
};