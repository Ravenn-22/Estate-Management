import api from './api';

export const getAnnouncements = async () => {
  const response = await api.get('/announcements');
  return response.data;
};

export const createAnnouncement = async (data) => {
  const response = await api.post('/announcements', data);
  return response.data;
};