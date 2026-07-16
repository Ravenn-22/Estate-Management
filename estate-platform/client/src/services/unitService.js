import api from './api';

export const getUnits = async () => {
  const response = await api.get('/units');
  return response.data;
};

export const createUnit = async (data) => {
  const response = await api.post('/units', data);
  return response.data;
};

export const updateUnitStatus = async (id, status) => {
  const response = await api.patch(`/units/${id}/status`, { status });
  return response.data;
};