import { useEffect, useState } from 'react';
import { facturasApi } from '../../api/facturas.api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function AdminFacturas() {
  const [facturaId, setFacturaId] = useState('');
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    if (!facturaId) return;
    setLoading(true);
    try {
      // Intentar primero buscar por ID de factura
      const { data } = await facturasApi.getById(facturaId);
      setFactura(data);
    } catch {
      try {
        // Si falla, intentar buscar por ID de reserva
        const { data } = await facturasApi.getByReservaId(facturaId);
        setFactura(data);
      } catch {
        setFactura(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header"><h1>Facturas</h1></div>
      <div className="admin-filter">
        <input placeholder="ID de factura o reserva..." value={facturaId} onChange={(e) => setFacturaId(e.target.value)} />
        <button className="btn btn-primary" onClick={buscar}>Buscar</button>
      </div>
      {loading ? <LoadingSpinner /> : factura ? (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Reserva</th><th>Monto</th><th>Estado</th><th>Fecha Pago</th></tr></thead>
            <tbody>
              <tr>
                <td>{factura.facturaId}</td>
                <td>{factura.reservaId}</td>
                <td>{formatCurrency(factura.monto)}</td>
                <td><StatusBadge status={factura.estado} /></td>
                <td>{formatDateTime(factura.fechaPago)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Buscar factura" description="Ingresa un ID para buscar" />}
    </div>
  );
}
