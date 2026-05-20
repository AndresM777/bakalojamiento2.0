import client from './client';

const BASE = '/fotos-lucano';

export const fotosApi = {
  getByAlojamientoId: (alojamientoId) =>
    client.get(`${BASE}/alojamiento/${alojamientoId}`),

  agregar: (data) => client.post(BASE, data),

  eliminar: (id) => client.delete(`${BASE}/${id}`),
};
