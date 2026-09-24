import { useAuth } from '@/composables/useAuth';

/**
 * fetch() compatível com o fluxo antigo de cookies e com o novo Bearer Token.
 * Se não houver token, funciona exatamente como um fetch normal com credentials.
 */
export function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const token = useAuth().getAuthToken();

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });
}
