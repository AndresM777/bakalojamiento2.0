import client from './client';

const BASE = '/facturas-lucanoV2';

export const facturasApi = {
  getById: (id) => client.get(`${BASE}/${id}`),

  getByReservaId: (reservaId) => client.get(`${BASE}/reserva/${reservaId}`),

  getResumenByReservaId: (reservaId) =>
    client.get(`${BASE}/resumen/reserva/${reservaId}`),

  crear: (data) => client.post(BASE, data),

  aprobar: (id) => client.patch(`${BASE}/${id}/aprobar`),

  rechazar: (id) => client.patch(`${BASE}/${id}/rechazar`),
};
