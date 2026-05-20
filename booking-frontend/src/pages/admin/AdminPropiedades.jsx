import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { alojamientosApi } from '../../api/alojamientos.api';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StarRating from '../../components/ui/StarRating';

const emptyForm = { nombre: '', descripcion: '', direccion: '', ciudad: '', estrellas: 3, socioId: 1, tipoAlojamientoId: 1, admiteMascotas: false, tienePiscina: false, tieneParqueadero: false };

export default function AdminPropiedades() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await alojamientosApi.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditId(item.alojamientoId);
    setForm({ nombre: item.nombre || '', descripcion: item.descripcion || '', direccion: item.direccion || '', ciudad: item.ciudad || '', estrellas: item.estrellas || 3, socioId: item.socioId || 1, tipoAlojamientoId: item.tipoAlojamientoId || 1, admiteMascotas: item.admiteMascotas || false, tienePiscina: item.tienePiscina || false, tieneParqueadero: item.tieneParqueadero || false });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.direccion) { toast.error('Nombre y dirección son obligatorios'); return; }
    setSaving(true);
    try {
      if (editId) { await alojamientosApi.actualizar(editId, form); toast.success('Propiedad actualizada'); }
      else { await alojamientosApi.crear(form); toast.success('Propiedad creada'); }
      setModalOpen(false); fetchAll();
    } catch (err) { toast.error(err.backendMessage || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta propiedad?')) return;
    try { await alojamientosApi.eliminar(id); toast.success('Eliminada'); fetchAll(); }
    catch (err) { toast.error(err.backendMessage || 'Error al eliminar'); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Propiedades</h1>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> Crear</button>
      </div>

      {items.length === 0 ? <EmptyState title="Sin propiedades" /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Nombre</th><th>Ciudad</th><th>Estrellas</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.alojamientoId}>
                  <td>{i.alojamientoId}</td>
                  <td>{i.nombre}</td>
                  <td>{i.ciudad || '—'}</td>
                  <td><StarRating rating={i.estrellas} size={14} /></td>
                  <td>{i.estado}</td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => openEdit(i)}><HiOutlinePencil size={16} /></button>
                    <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(i.alojamientoId)}><HiOutlineTrash size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar Propiedad' : 'Nueva Propiedad'}>
        <div className="modal-form">
          <div className="form-group"><label>Nombre *</label><input name="nombre" value={form.nombre} onChange={handleChange} /></div>
          <div className="form-group"><label>Ciudad</label><input name="ciudad" value={form.ciudad} onChange={handleChange} /></div>
          <div className="form-group"><label>Dirección *</label><input name="direccion" value={form.direccion} onChange={handleChange} /></div>
          <div className="form-group"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} /></div>
          <div className="form-group"><label>Estrellas</label><input name="estrellas" type="number" min="1" max="5" value={form.estrellas} onChange={handleChange} /></div>
          <div className="form-row">
            <label className="checkbox-label"><input type="checkbox" name="admiteMascotas" checked={form.admiteMascotas} onChange={handleChange} /> Mascotas</label>
            <label className="checkbox-label"><input type="checkbox" name="tienePiscina" checked={form.tienePiscina} onChange={handleChange} /> Piscina</label>
            <label className="checkbox-label"><input type="checkbox" name="tieneParqueadero" checked={form.tieneParqueadero} onChange={handleChange} /> Parqueadero</label>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
