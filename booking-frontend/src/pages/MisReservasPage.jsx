import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCalendarDays } from 'react-icons/hi2';
import { reservasApi } from '../api/reservas.api';
import useAuthStore from '../stores/useAuthStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate, formatCurrency } from '../utils/formatters';

export default function MisReservasPage() {
  const { getClienteId, isAuthenticated } = useAuthStore();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const cid = getClienteId();
      if (!cid) { setLoading(false); return; }
      try {
        const { data } = await reservasApi.getByClienteId(cid);
        setReservas(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (isAuthenticated) fetch(); else setLoading(false);
  }, [isAuthenticated, getClienteId]);

  if (!isAuthenticated) return (
    <div className="container page-padding">
      <EmptyState title="Inicia sesión" description="Necesitas iniciar sesión para ver tus reservas"
        action={<Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>} />
    </div>
  );
  if (loading) return <LoadingSpinner text="Cargando reservas..." />;

  return (
    <div className="mis-reservas-page">
      <div className="container">
        <h1>Mis Reservas</h1>
        {reservas.length === 0 ? (
          <EmptyState icon={<HiOutlineCalendarDays size={48} />} title="Sin reservas"
            description="Aún no has realizado ninguna reserva"
            action={<Link to="/propiedades" className="btn btn-primary">Explorar</Link>} />
        ) : (
          <div className="reservas-list">
            {reservas.map((r) => (
              <div key={r.reservaId} className="reserva-card">
                <div className="reserva-card-header">
                  <span className="reserva-code">{r.codigoReserva}</span>
                  <StatusBadge status={r.estado} />
                </div>
                <div className="reserva-card-body">
                  <div className="reserva-dates">
                    <div><span className="label">Check-in</span><span className="value">{formatDate(r.fechaCheckIn)}</span></div>
                    <span className="date-arrow">→</span>
                    <div><span className="label">Check-out</span><span className="value">{formatDate(r.fechaCheckOut)}</span></div>
                  </div>
                  <div className="reserva-details">
                    <span>{r.numAdultos} adultos · {r.numNinos} niños · {r.numHabitaciones} hab.</span>
                  </div>
                </div>
                <div className="reserva-card-footer">
                  <strong>{formatCurrency(r.total)}</strong>
                  <div className="reserva-actions">
                    {r.estado?.toLowerCase() === 'pendiente' && (
                      <Link to={`/checkout/${r.reservaId}`} className="btn btn-primary btn-sm">Pagar</Link>
                    )}
                    {r.estado?.toLowerCase() === 'confirmada' && (
                      <Link to={`/factura/${r.reservaId}`} className="btn btn-ghost btn-sm">Ver Factura</Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
