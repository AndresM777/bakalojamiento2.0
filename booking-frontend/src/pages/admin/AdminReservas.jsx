import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { reservasApi } from '../../api/reservas.api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function AdminReservas() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await reservasApi.getByClienteId(0);
        setItems(Array.isArray(data) ? data : []);
      } catch { setItems([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleEstado = async (id, estado) => {
    try {
      await reservasApi.actualizarEstado(id, { estado });
      toast.success(`Reserva → ${estado}`);
      setItems((prev) => prev.map((i) => i.reservaId === id ? { ...i, estado } : i));
    } catch (err) { toast.error(err.backendMessage || 'Error'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-section">
      <div className="admin-section-header"><h1>Reservas</h1></div>
      {items.length === 0 ? <EmptyState title="Sin reservas" /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Código</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.reservaId}>
                  <td>{r.reservaId}</td>
                  <td className="font-mono">{r.codigoReserva}</td>
                  <td>{formatDate(r.fechaCheckIn)}</td>
                  <td>{formatDate(r.fechaCheckOut)}</td>
                  <td>{formatCurrency(r.total)}</td>
                  <td><StatusBadge status={r.estado} /></td>
                  <td className="actions-cell">
                    {r.estado?.toLowerCase() === 'pendiente' && (
                      <>
                        <button className="btn btn-sm btn-success" onClick={() => handleEstado(r.reservaId, 'Confirmada')}>Confirmar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleEstado(r.reservaId, 'Cancelada')}>Cancelar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
