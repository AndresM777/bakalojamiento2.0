import client from './client';

const BASE = '/clientes-lucano';

export const clientesApi = {
  getAll: (params = {}) => {
    const { page = 1, size = 10, nombre } = params;
    const query = [];
    query.push(`page=${page}`);
    query.push(`size=${size}`);
    if (nombre) query.push(`nombre=${encodeURIComponent(nombre)}`);
    return client.get(`${BASE}?${query.join('&')}`);
  },

  getById: (clienteId) => client.get(`${BASE}/${clienteId}`),

  getByCedula: (cedula) => client.get(`${BASE}/cedula/${cedula}`),

  registrar: (data) => client.post(`${BASE}/registrar`, data),

  actualizar: (id, data) => client.put(`${BASE}/${id}`, data),

  cambiarEstado: (id, data) => client.patch(`${BASE}/${id}/estado`, data),

  eliminar: (id) => client.delete(`${BASE}/${id}`),
};
