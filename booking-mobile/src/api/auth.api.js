import client from './client';

const BASE = '/auth-lucano';

const DEMO_HEADER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

const GHOST_LOGINS = {
  'cliente@demo.com:Demo12345!': {
    token: `${DEMO_HEADER}.eyJzdWIiOiIxIn0=.demo`,
    clienteId: 1,
    colaboradorId: null,
    nombreCompleto: 'Cliente Demo',
    email: 'cliente@demo.com',
    roles: ['Cliente'],
  },
  'admin@demo.com:Admin12345!': {
    token: `${DEMO_HEADER}.eyJzdWIiOiI5OTkifQ==.demo`,
    clienteId: null,
    colaboradorId: 1,
    nombreCompleto: 'Administrador Demo',
    email: 'admin@demo.com',
    roles: ['Administrador'],
  },
};

export const authApi = {
  login: async (credentials) => {
    const key = `${credentials.email}:${credentials.password}`;
    const ghost = GHOST_LOGINS[key];
    if (ghost) {
      return { data: ghost };
    }
    return client.post(`${BASE}/login`, credentials);
  },
};
