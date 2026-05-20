import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { habitacionesApi } from '../../api/habitaciones.api';
import { alojamientosApi } from '../../api/alojamientos.api';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatters';

const emptyForm = { alojamientoId: '', nombre: '', descripcion: '', capacidadAdultos: 2, capacidadNinos: 0, numBanos: 1, numDormitorios: 1, tieneCocina: false, tieneAireAcondicionado: false, superficieM2: 0, precioNoche: 0 };

export default function AdminHabitaciones() {
  const [propiedades, setPropiedades] = useState([]);
  const [selectedProp, setSelectedProp] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    alojamientosApi.getAll().then(({ data }) => {
      const list = Array.isArray(data) ? data : [];
      setPropiedades(list);
      if (list.length > 0) setSelectedProp(list[0].alojamientoId);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fetchHabs = useCallback(async () => {
    if (!selectedProp) return;
    setLoading(true);
    try {
      const { data } = await habitacionesApi.getByAlojamientoId(selectedProp);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [selectedProp]);

  useEffect(() => { fetchHabs(); }, [fetchHabs]);

  const openCreate = () => { setEditId(null); setForm({ ...emptyForm, alojamientoId: selectedProp }); setModalOpen(true); };
  const openEdit = (item) => {
    setEditId(item.habitacionId);
    setForm({ alojamientoId: item.alojamientoId, nombre: item.nombre || '', descripcion: item.descripcion || '', capacidadAdultos: item.capacidadAdultos, capacidadNinos: item.capacidadNinos, numBanos: item.numBanos, numDormitorios: item.numDormitorios, tieneCocina: item.tieneCocina, tieneAireAcondicionado: item.tieneAireAcondicionado, superficieM2: item.superficieM2 || 0, precioNoche: item.precioNoche });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.precioNoche) { toast.error('Nombre y precio son obligatorios'); return; }
    setSaving(true);
    try {
      const payload = { ...form, precioNoche: Number(form.precioNoche), superficieM2: Number(form.superficieM2), alojamientoId: Number(form.alojamientoId) };
      if (editId) { await habitacionesApi.actualizar(editId, payload); toast.success('Habitación actualizada'); }
      else { await habitacionesApi.crear(payload); toast.success('Habitación creada'); }
      setModalOpen(false); fetchHabs();
    } catch (err) { toast.error(err.backendMessage || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    try { await habitacionesApi.eliminar(id); toast.success('Eliminada'); fetchHabs(); }
    catch (err) { toast.error(err.backendMessage || 'Error'); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Habitaciones</h1>
        <button className="btn btn-primary" onClick={openCreate} disabled={!selectedProp}><HiOutlinePlus size={18} /> Crear</button>
      </div>

      <div className="admin-filter">
        <label>Propiedad:</label>
        <select value={selectedProp} onChange={(e) => setSelectedProp(e.target.value)}>
          {propiedades.map((p) => <option key={p.alojamientoId} value={p.alojamientoId}>{p.nombre}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState title="Sin habitaciones" /> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Nombre</th><th>Capacidad</th><th>Precio/Noche</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.habitacionId}>
                  <td>{i.habitacionId}</td>
                  <td>{i.nombre}</td>
                  <td>{i.capacidadAdultos}A + {i.capacidadNinos}N</td>
                  <td>{formatCurrency(i.precioNoche)}</td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => openEdit(i)}><HiOutlinePencil size={16} /></button>
                    <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(i.habitacionId)}><HiOutlineTrash size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar Habitación' : 'Nueva Habitación'}>
        <div className="modal-form">
          <div className="form-group"><label>Nombre *</label><input name="nombre" value={form.nombre} onChange={handleChange} /></div>
          <div className="form-group"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} /></div>
          <div className="form-row">
            <div className="form-group"><label>Adultos</label><input name="capacidadAdultos" type="number" min="1" value={form.capacidadAdultos} onChange={handleChange} /></div>
            <div className="form-group"><label>Niños</label><input name="capacidadNinos" type="number" min="0" value={form.capacidadNinos} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Dormitorios</label><input name="numDormitorios" type="number" min="1" value={form.numDormitorios} onChange={handleChange} /></div>
            <div className="form-group"><label>Baños</label><input name="numBanos" type="number" min="1" value={form.numBanos} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Superficie m²</label><input name="superficieM2" type="number" min="0" value={form.superficieM2} onChange={handleChange} /></div>
            <div className="form-group"><label>Precio/Noche *</label><input name="precioNoche" type="number" min="0" value={form.precioNoche} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <label className="checkbox-label"><input type="checkbox" name="tieneCocina" checked={form.tieneCocina} onChange={handleChange} /> Cocina</label>
            <label className="checkbox-label"><input type="checkbox" name="tieneAireAcondicionado" checked={form.tieneAireAcondicionado} onChange={handleChange} /> A/C</label>
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
