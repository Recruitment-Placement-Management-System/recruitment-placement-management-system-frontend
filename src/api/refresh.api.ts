import axios from 'axios';

const refreshApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const refreshAccessToken = async () => {
  const response = await refreshApi.post('/auth/refresh-token');

  return response.data;
}