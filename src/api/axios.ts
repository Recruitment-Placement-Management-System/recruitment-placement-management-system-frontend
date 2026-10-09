import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import useAuthStore from '../store/auth.store';
import { refreshAccessToken } from './refresh.api';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await refreshAccessToken();

      const newAccessToken = response.accessToken;

      useAuthStore.getState().setAccessToken(newAccessToken);

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();

      const path = window.location.pathname;

      if (path.startsWith('/admin')) {
    window.location.href = '/admin/login';
  } else {
    window.location.href = '/login';
  }

      return Promise.reject(refreshError);
    }
  },
);

export default api;