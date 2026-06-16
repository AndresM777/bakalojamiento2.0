import client from './client';

const BASE = '/fotos-lucanoV2';

export const fotosApi = {
  getByAlojamientoId: (alojamientoId) =>
    client.get(`${BASE}/alojamiento/${alojamientoId}`),

  agregar: (data) => client.post(BASE, data),

  eliminar: (id) => client.delete(`${BASE}/${id}`),
};
