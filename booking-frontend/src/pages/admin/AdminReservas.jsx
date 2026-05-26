import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { reservasApi } from '../../api/reservas.api';
import { clientesApi } from '../../api/clientes.api';
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
        // 1. Obtener todos los clientes (paginación amplia para traer todos)
        const { data: resClientes } = await clientesApi.getAll({ page: 1, size: 200 });
        const listaClientes = Array.isArray(resClientes)
          ? resClientes
          : (Array.isArray(resClientes?.items) ? resClientes.items : []);

        if (listaClientes.length === 0) {
          setItems([]);
          return;
        }

        // 2. Traer en paralelo las reservas de cada cliente
        const promesas = listaClientes.map(async (cliente) => {
          try {
            const { data } = await reservasApi.getByClienteId(cliente.clienteId);
            return Array.isArray(data) ? data : [];
          } catch {
            return [];
          }
        });

        const resultados = await Promise.all(promesas);
        // Aplanar todos los arreglos de reservas
        const todasLasReservas = resultados.flat();
        
        // Ordenar por ID o fecha para que aparezcan en un orden lógico
        todasLasReservas.sort((a, b) => b.reservaId - a.reservaId);

        setItems(todasLasReservas);
      } catch (err) {
        console.error('Error cargando reservas de clientes:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
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
            <thead><tr><th>ID</th><th>Código</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Estado</th><th>Factura</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.reservaId}>
                  <td>{r.reservaId}</td>
                  <td className="font-mono">{r.codigoReserva}</td>
                  <td>{formatDate(r.fechaCheckIn)}</td>
                  <td>{formatDate(r.fechaCheckOut)}</td>
                  <td>{formatCurrency(r.total)}</td>
                  <td><StatusBadge status={r.estado} /></td>
                  <td>
                    {r.estado?.toLowerCase() === 'confirmada' ? (
                      <Link to={`/factura/${r.reservaId}`} className="btn btn-sm btn-ghost" style={{ textDecoration: 'underline', color: '#6366f1' }}>
                        Ver Factura
                      </Link>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
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
