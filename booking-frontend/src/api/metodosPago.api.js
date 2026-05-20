import client from './client';

const BASE = '/metodospago-lucano';

export const metodosPagoApi = {
  getAll: () => client.get(BASE),
};
