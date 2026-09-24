import axios from 'axios';
import { API_URL } from '@/config/api';
import { useAuth } from '@/composables/useAuth';

// Instância usada pelas páginas lazy-loaded que já utilizavam Axios.
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

// O cookie/sessão continua sendo enviado. O Bearer entra como fallback para
// navegadores que bloqueiam cookies de terceiros (incluindo guia anônima).
api.interceptors.request.use((config) => {
  const token = useAuth().getAuthToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
