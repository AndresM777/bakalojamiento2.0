import client from './client';

const BASE = '/auth-lucano';

export const authApi = {
  login: (credentials) => client.post(`${BASE}/login`, credentials),
};
