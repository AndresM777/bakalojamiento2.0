import client from './client';

const BASE = '/reservas-lucanoV2';

export const reservasApi = {
  getById: (id) => client.get(`${BASE}/${id}`),

  getByClienteId: (clienteId) => client.get(`${BASE}/cliente/${clienteId}`),

  getResumenByClienteId: (clienteId) =>
    client.get(`${BASE}/resumen/cliente/${clienteId}`),

  crear: (data) => client.post(BASE, data),

  actualizarEstado: (id, data) => client.patch(`${BASE}/${id}/estado`, data),
};
