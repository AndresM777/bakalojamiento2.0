import { NavLink, Outlet } from 'react-router-dom';
import {
  HiOutlineChartBarSquare,
  HiOutlineBuildingOffice2,
  HiOutlineKey,
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
  HiOutlineBanknotes,
  HiOutlineArrowLeft,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: HiOutlineChartBarSquare, end: true },
  { to: '/admin/propiedades', label: 'Propiedades', icon: HiOutlineBuildingOffice2 },
  { to: '/admin/habitaciones', label: 'Habitaciones', icon: HiOutlineKey },
  { to: '/admin/usuarios', label: 'Usuarios', icon: HiOutlineUsers },
  { to: '/admin/reservas', label: 'Reservas', icon: HiOutlineClipboardDocumentList },
  { to: '/admin/facturas', label: 'Facturas', icon: HiOutlineBanknotes },
];

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <HiOutlineBuildingOffice2 size={28} />
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-link">
            <HiOutlineArrowLeft size={20} />
            <span>Volver al sitio</span>
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
