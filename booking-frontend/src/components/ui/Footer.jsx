import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <HiOutlineBuildingOffice2 size={24} />
          <span>AlojamientoMR</span>
        </div>
        <p className="footer-copy">
          &copy; {currentYear} AlojamientoMR — Plataforma de Reservas.
          Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
