import { computed, ref } from 'vue';

const STORAGE_KEY = 'usuario';

function readStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Não foi possível ler a sessão local:', error);
    return null;
  }
}

// Singleton de módulo: todas as páginas compartilham a mesma referência reativa.
const usuario = ref(readStoredUser());
const isLoggedIn = computed(() => Boolean(usuario.value?.id));
const usuarioId = computed(() => usuario.value?.id ?? null);

function persistUser(user) {
  if (typeof window === 'undefined') return;

  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
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
  };
}
