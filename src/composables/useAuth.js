import { computed, ref } from 'vue';

const USER_STORAGE_KEY = 'usuario';
const TOKEN_STORAGE_KEY = 'auth_token';

function safeParseUser(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Não foi possível ler a sessão local:', error);
    return null;
  }
}

function readStoredUser() {
  if (typeof window === 'undefined') return null;
  return safeParseUser(window.localStorage.getItem(USER_STORAGE_KEY));
}

// Singleton de módulo: todas as páginas compartilham a mesma referência reativa.
const usuario = ref(readStoredUser());
const isLoggedIn = computed(() => Boolean(usuario.value?.id));
const usuarioId = computed(() => usuario.value?.id ?? null);

function persistUser(user) {
  if (typeof window === 'undefined') return;

  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function setAuthToken(token) {
  if (typeof window === 'undefined') return;

  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function clearAuthToken() {
  setAuthToken(null);
}

function setUsuario(user) {
  usuario.value = user ? { ...user } : null;
  persistUser(usuario.value);
}

function updateUsuario(partial) {
  if (!usuario.value) return;
  setUsuario({ ...usuario.value, ...partial });
}

function clearUsuario() {
  usuario.value = null;
  persistUser(null);
}

function clearAuth() {
  clearUsuario();
  clearAuthToken();
}

// Usado para sincronização entre abas/janelas via evento "storage".
function syncUsuarioFromStorage() {
  usuario.value = readStoredUser();
}

export function useAuth() {
  return {
    usuario,
    usuarioId,
    isLoggedIn,
    setUsuario,
    updateUsuario,
    clearUsuario,
    syncUsuarioFromStorage,
    getAuthToken,
    setAuthToken,
    clearAuthToken,
    clearAuth,
  };
}
