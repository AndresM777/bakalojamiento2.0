import client from './client';

const BASE = '/metodospago-lucanoV2';

export const metodosPagoApi = {
  getAll: () => client.get(BASE),
};
