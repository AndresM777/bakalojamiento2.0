import client from './client';

const BASE = '/usuarios-lucano';

export const usuariosApi = {
  getAll: () => client.get(BASE),
  getById: (id) => client.get(`${BASE}/${id}`),
};
