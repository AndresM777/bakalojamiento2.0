import client from './client';

const BASE = '/reservas-lucano';

export const reservasApi = {
  getById: (id) => client.get(`${BASE}/${id}`),

  getByClienteId: (clienteId) => client.get(`${BASE}/cliente/${clienteId}`),

  getResumenByClienteId: (clienteId) =>
    client.get(`${BASE}/resumen/cliente/${clienteId}`),

  // Crear V1 (antigua ruta)
  crear: (data) => client.post(BASE, data),

  // Crear V2 (con idempotencia y payload simplificado)
  crearV2: (data, idempotencyKey) => {
    // Al apuntar a la V2, sobreescribimos la ruta completa para usar /api/v2
    return client.post(
      'https://apigatway-0wjx.onrender.com/api/v2/reservas-lucano',
      data,
      {
        headers: {
          'X-Idempotency-Key': idempotencyKey,
        },
      }
    );
  },

  actualizarEstado: (id, data) => client.patch(`${BASE}/${id}/estado`, data),
};
