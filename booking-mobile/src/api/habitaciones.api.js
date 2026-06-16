import client from './client';

const BASE = '/habitaciones-lucanoV2';

export const habitacionesApi = {
  getByAlojamientoId: (alojamientoId) =>
    client.get(`${BASE}/alojamiento/${alojamientoId}`),

  getById: (id) => client.get(`${BASE}/${id}`),

  crear: (data) => client.post(BASE, data),

  actualizar: (id, data) => client.put(`${BASE}/${id}`, data),

  eliminar: (id) => client.delete(`${BASE}/${id}`),
};
