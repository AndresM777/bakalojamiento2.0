import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { facturasApi } from '../api/facturas.api';
import { reservasApi } from '../api/reservas.api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

export default function FacturaPage() {
  const { codigo } = useParams();
  const [factura, setFactura] = useState(null);
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const resR = await reservasApi.getById(codigo);
        setReserva(resR.data);
        const resF = await facturasApi.getByReservaId(resR.data.reservaId);
        setFactura(resF.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [codigo]);

  if (loading) return <LoadingSpinner text="Cargando factura..." />;
  if (!factura) return <div className="container page-padding"><p>Factura no encontrada.</p></div>;

  return (
    <div className="factura-page">
      <div className="container">
        <div className="factura-card">
          <div className="factura-header">
            <div>
              <h1>Factura #{factura.facturaId}</h1>
              <StatusBadge status={factura.estado} />
            </div>
            <button className="btn btn-ghost" onClick={() => window.print()}>Imprimir</button>
          </div>

          <div className="factura-body">
            <div className="factura-section">
              <h3>Datos de la Reserva</h3>
              {reserva && (
                <div className="factura-grid">
                  <div><span className="label">Código</span><span>{reserva.codigoReserva}</span></div>
                  <div><span className="label">Check-in</span><span>{formatDate(reserva.fechaCheckIn)}</span></div>
                  <div><span className="label">Check-out</span><span>{formatDate(reserva.fechaCheckOut)}</span></div>
                  <div><span className="label">Huéspedes</span><span>{reserva.numAdultos} adultos, {reserva.numNinos} niños</span></div>
                </div>
              )}
            </div>

            <div className="factura-section">
              <h3>Detalle del Pago</h3>
              <div className="factura-grid">
                <div><span className="label">Monto</span><strong>{formatCurrency(factura.monto)}</strong></div>
                <div><span className="label">Fecha de pago</span><span>{formatDateTime(factura.fechaPago)}</span></div>
                <div><span className="label">Estado</span><StatusBadge status={factura.estado} /></div>
              </div>
            </div>
          </div>

          <div className="factura-footer">
            <p>Gracias por tu reserva en Rodrigo's</p>
          </div>
        </div>
      </div>
    </div>
  );
}
