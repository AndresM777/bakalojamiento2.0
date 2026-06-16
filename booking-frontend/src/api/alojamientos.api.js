import client from './client';

const BASE = '/alojamientos-lucanoV2';

export const alojamientosApi = {
  getAll: () => client.get(BASE),

  getById: (id) => client.get(`${BASE}/${id}`),

  crear: (data) => client.post(BASE, data),

  actualizar: (id, data) => client.put(`${BASE}/${id}`, data),

  eliminar: (id) => client.delete(`${BASE}/${id}`),
};
