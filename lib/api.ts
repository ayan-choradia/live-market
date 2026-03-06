import axios from 'axios';
import { useStore } from '@/store/useStore';

const QH_API_BASE = 'https://qh-api.corp.hertshtengroup.com';

export const qhApi = axios.create({
  baseURL: QH_API_BASE,
});

qhApi.interceptors.request.use((config) => {
  const token = useStore.getState().qhToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
