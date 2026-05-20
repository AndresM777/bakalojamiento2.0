import client from './client';

const BASE = '/calendario-lucano';

export const calendarioApi = {
  getDisponibilidad: (habitacionId, mes, anio) =>
    client.get(`${BASE}/habitacion/${habitacionId}`, {
      params: { mes, anio },
    }),

  bloquearFechas: (data) => client.post(`${BASE}/bloquear`, data),
};
