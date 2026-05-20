import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

export default function EmptyState({
  icon,
  title = 'Sin resultados',
  description = 'No se encontraron datos para mostrar.',
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon || <HiOutlineExclamationTriangle size={48} />}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
