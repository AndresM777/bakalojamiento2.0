import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { clientesApi } from '../../api/clientes.api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';

export default function AdminUsuarios() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await clientesApi.getAll({ page, size: 20, nombre: debouncedSearch || undefined });
      const list = data?.items || data?.data || (Array.isArray(data) ? data : []);
      setItems(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggleEstado = async (id, currentEstado) => {
    try {
      await clientesApi.cambiarEstado(id, { estado: !currentEstado });
      toast.success('Estado actualizado');
      fetchAll();
    } catch (err) { toast.error(err.backendMessage || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try { await clientesApi.eliminar(id); toast.success('Eliminado'); fetchAll(); }
    catch (err) { toast.error(err.backendMessage || 'Error'); }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Usuarios / Clientes</h1>
      </div>

      <div className="admin-filter">
        <div className="search-bar">
          <HiOutlineMagnifyingGlass size={18} />
          <input placeholder="Buscar por nombre..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState title="Sin clientes" /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Cédula</th><th>Email</th><th>Teléfono</th><th>Reservas</th><th>Fecha Registro</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.clienteId}>
                  <td>{c.clienteId}</td>
                  <td>{c.cedula}</td>
                  <td>{c.email}</td>
                  <td>{c.telefono || '—'}</td>
                  <td>{c.totalReservas}</td>
                  <td>{formatDate(c.fechaCreacion)}</td>
                  <td className="actions-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.clienteId)}>Eliminar</button>
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
