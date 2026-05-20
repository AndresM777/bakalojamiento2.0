import { useEffect, useState } from 'react';
import { HiOutlineBuildingOffice2, HiOutlineUsers, HiOutlineClipboardDocumentList, HiOutlineBanknotes } from 'react-icons/hi2';
import { alojamientosApi } from '../../api/alojamientos.api';
import { clientesApi } from '../../api/clientes.api';
import { reservasApi } from '../../api/reservas.api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ propiedades: 0, clientes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [propRes, cliRes] = await Promise.all([
          alojamientosApi.getAll(),
          clientesApi.getAll({ page: 1, size: 1 }),
        ]);
        const propiedades = Array.isArray(propRes.data) ? propRes.data.length : 0;
        const clientes = cliRes.data?.totalCount ?? (Array.isArray(cliRes.data) ? cliRes.data.length : 0);
        setStats({ propiedades, clientes });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const cards = [
    { label: 'Propiedades', value: stats.propiedades, icon: HiOutlineBuildingOffice2, color: '#6366f1' },
    { label: 'Clientes', value: stats.clientes, icon: HiOutlineUsers, color: '#06b6d4' },
  ];

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      <p className="admin-subtitle">Resumen general del sistema</p>
      <div className="stats-grid">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card" style={{ borderLeftColor: color }}>
            <div className="stat-card-icon" style={{ color }}><Icon size={32} /></div>
            <div className="stat-card-info">
              <span className="stat-value">{loading ? '—' : value}</span>
              <span className="stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
