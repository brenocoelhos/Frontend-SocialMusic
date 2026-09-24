import axios from 'axios';
import { API_URL } from '@/config/api';

// Instância usada somente pelas páginas que precisam de Axios.
// Como essas páginas são lazy-loaded, o Axios deixa de pesar no bundle inicial.
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});
