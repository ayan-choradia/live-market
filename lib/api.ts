import axios from 'axios';
import { useStore } from '@/store/useStore';

export const qhApi = axios.create({
  baseURL: '', // Use relative URL to hit Next.js API routes
});

qhApi.interceptors.request.use((config) => {
  const token = useStore.getState().qhToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
