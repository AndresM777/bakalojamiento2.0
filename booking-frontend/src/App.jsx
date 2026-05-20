import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthGuard from './guards/AuthGuard';
import AdminGuard from './guards/AdminGuard';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PropiedadesPage from './pages/PropiedadesPage';
import PropiedadDetallePage from './pages/PropiedadDetallePage';
import MisReservasPage from './pages/MisReservasPage';
import CheckoutPage from './pages/CheckoutPage';
import FacturaPage from './pages/FacturaPage';
import NotFoundPage from './pages/NotFoundPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPropiedades from './pages/admin/AdminPropiedades';
import AdminHabitaciones from './pages/admin/AdminHabitaciones';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminReservas from './pages/admin/AdminReservas';
import AdminFacturas from './pages/admin/AdminFacturas';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: '.875rem',
            boxShadow: '0 10px 25px rgba(0,0,0,.15)',
          },
        }}
      />
      <Routes>
        {/* ── Rutas públicas ──────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/propiedades" element={<PropiedadesPage />} />
          <Route path="/propiedades/:id" element={<PropiedadDetallePage />} />
          <Route
            path="/mis-reservas"
            element={<AuthGuard><MisReservasPage /></AuthGuard>}
          />
          <Route
            path="/checkout/:codigo"
            element={<AuthGuard><CheckoutPage /></AuthGuard>}
          />
          <Route
            path="/factura/:codigo"
            element={<AuthGuard><FacturaPage /></AuthGuard>}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ── Rutas admin ─────────────────────────── */}
        <Route
          path="/admin"
          element={<AdminGuard><AdminLayout /></AdminGuard>}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="propiedades" element={<AdminPropiedades />} />
          <Route path="habitaciones" element={<AdminHabitaciones />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="reservas" element={<AdminReservas />} />
          <Route path="facturas" element={<AdminFacturas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
