// Fonte única para o endereço do backend.
// Em produção mantém o Render como fallback; em desenvolvimento mantém o
// localhost que já era usado em partes do projeto. VITE_API_URL continua
// tendo prioridade em qualquer ambiente.
const FALLBACK_API_URL = import.meta.env.DEV
  ? 'http://localhost/socialmusic_backend'
  : 'https://backend-socialmusic.onrender.com';

export const API_URL = (import.meta.env.VITE_API_URL || FALLBACK_API_URL).replace(/\/$/, '');
