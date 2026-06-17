import axios from 'axios';

// Frontend usa /api/v2 como prefijo lógico de la versión del contrato.
// Vercel reescribe /api/v2/* → gateway/api/v1/* internamente.
const BASE_URL = '/api/v2';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: inyectar JWT ──────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('booking_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: manejo centralizado ──────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('booking_token');
      localStorage.removeItem('booking_user');
      // Solo redirigir si no estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Extraer mensaje de error del backend
    const backendMessage =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      error.response?.data?.title ||
      (typeof error.response?.data === 'string' ? error.response.data : null);

    if (backendMessage) {
      error.backendMessage = backendMessage;
    }

    return Promise.reject(error);
  }
);

export default client;
