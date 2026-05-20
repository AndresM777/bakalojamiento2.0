export default function StatusBadge({ status }) {
  const statusConfig = {
    // Reservas
    pendiente: { label: 'Pendiente', className: 'badge-warning' },
    confirmada: { label: 'Confirmada', className: 'badge-success' },
    cancelada: { label: 'Cancelada', className: 'badge-danger' },
    completada: { label: 'Completada', className: 'badge-info' },
    // Facturas
    aprobado: { label: 'Aprobado', className: 'badge-success' },
    rechazado: { label: 'Rechazado', className: 'badge-danger' },
    // Alojamientos
    activo: { label: 'Activo', className: 'badge-success' },
    inactivo: { label: 'Inactivo', className: 'badge-neutral' },
    // Calendario
    disponible: { label: 'Disponible', className: 'badge-success' },
    ocupado: { label: 'Ocupado', className: 'badge-danger' },
    bloqueado: { label: 'Bloqueado', className: 'badge-warning' },
    // Usuarios
    true: { label: 'Activo', className: 'badge-success' },
    false: { label: 'Inactivo', className: 'badge-danger' },
  };

  const key = String(status).toLowerCase();
  const config = statusConfig[key] || {
    label: status,
    className: 'badge-neutral',
  };

  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}
