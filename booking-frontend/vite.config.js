import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const usuariosPort = env.VITE_MS_USUARIOS_PORT || '5001';
  const alojamientosPort = env.VITE_MS_ALOJAMIENTOS_PORT || '5002';
  const reservasPort = env.VITE_MS_RESERVAS_PORT || '5003';
  const facturacionPort = env.VITE_MS_FACTURACION_PORT || '5004';

  return {
    plugins: [react()],
    base: '/',
    server: {
      port: 5173,
      proxy: {
        // ── MS Usuarios ──────────────────────────────
        '/api/v1/auth-lucano': {
          target: `http://127.0.0.1:${usuariosPort}`,
          changeOrigin: true,
          secure: false,
        },
        '/api/v1/clientes-lucano': {
          target: `http://127.0.0.1:${usuariosPort}`,
          changeOrigin: true,
          secure: false,
        },
        '/api/v1/usuarios-lucano': {
          target: `http://127.0.0.1:${usuariosPort}`,
          changeOrigin: true,
          secure: false,
        },
        '/api/v1/localizaciones-lucano': {
          target: `http://127.0.0.1:${usuariosPort}`,
          changeOrigin: true,
          secure: false,
        },
        // ── MS Alojamientos ──────────────────────────
        '/api/v1/alojamientos-lucano': {
          target: `http://127.0.0.1:${alojamientosPort}`,
          changeOrigin: true,
          secure: false,
        },
        '/api/v1/habitaciones-lucano': {
          target: `http://127.0.0.1:${alojamientosPort}`,
          changeOrigin: true,
          secure: false,
        },
        '/api/v1/calendario-lucano': {
          target: `http://127.0.0.1:${alojamientosPort}`,
          changeOrigin: true,
          secure: false,
        },
        '/api/v1/fotos-lucano': {
          target: `http://127.0.0.1:${alojamientosPort}`,
          changeOrigin: true,
          secure: false,
        },
        // ── MS Reservas ──────────────────────────────
        '/api/v1/reservas-lucano': {
          target: `http://127.0.0.1:${reservasPort}`,
          changeOrigin: true,
          secure: false,
        },
        // ── MS Facturación ───────────────────────────
        '/api/v1/facturas-lucano': {
          target: `http://127.0.0.1:${facturacionPort}`,
          changeOrigin: true,
          secure: false,
        },
        '/api/v1/metodospago-lucano': {
          target: `http://127.0.0.1:${facturacionPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
