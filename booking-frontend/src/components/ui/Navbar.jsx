import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineBuildingOffice2, HiOutlineUser, HiOutlineArrowRightOnRectangle, HiOutlineCog6Tooth, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import useAuthStore from '../../stores/useAuthStore';

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <HiOutlineBuildingOffice2 size={28} />
          <span>AlojamientoMR</span>
        </Link>

        <div className="navbar-links">
          <Link to="/propiedades" className="nav-link">Explorar</Link>

          {isAuthenticated ? (
            <>
              <Link to="/mis-reservas" className="nav-link">
                <HiOutlineClipboardDocumentList size={18} />
                Mis Reservas
              </Link>

              {isAdmin() && (
                <Link to="/admin" className="nav-link nav-link-admin">
                  <HiOutlineCog6Tooth size={18} />
                  Admin
                </Link>
              )}

              <div className="navbar-user-menu">
                <button className="navbar-user-btn">
                  <HiOutlineUser size={18} />
                  <span>{user?.nombreCompleto?.split(' ')[0] || 'Cuenta'}</span>
                </button>
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-info">
                    <p className="dropdown-name">{user?.nombreCompleto}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                  <hr />
                  <button onClick={handleLogout} className="dropdown-item">
                    <HiOutlineArrowRightOnRectangle size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-auth-btns">
              <Link to="/login" className="btn btn-ghost">Iniciar Sesión</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
