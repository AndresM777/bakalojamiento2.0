import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { reservasApi } from '../api/reservas.api';
import { facturasApi } from '../api/facturas.api';
import { metodosPagoApi } from '../api/metodosPago.api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function CheckoutPage() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [reserva, setReserva] = useState(null);
  const [metodos, setMetodos] = useState([]);
  const [metodoId, setMetodoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagando, setPagando] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [resR, resM] = await Promise.all([
          reservasApi.getById(codigo),
          metodosPagoApi.getAll(),
        ]);
        setReserva(resR.data);
        const m = Array.isArray(resM.data) ? resM.data : [];
        setMetodos(m);
        if (m.length > 0) setMetodoId(m[0].metodoPagoId);
      } catch (err) {
        toast.error('No se pudo cargar la reserva');
        console.error(err);
      } finally { setLoading(false); }
    };
    fetch();
  }, [codigo]);

  const handlePagar = async () => {
    if (!metodoId) { toast.error('Selecciona un método de pago'); return; }
    setPagando(true);
    try {
      const payload = {
        reservaId: reserva.reservaId,
        metodoPagoId: Number(metodoId),
        monto: reserva.total,
        descripcion: `Pago reserva ${reserva.codigoReserva}`,
      };
      const { data } = await facturasApi.crear(payload);
      await facturasApi.aprobar(data.facturaId);
      toast.success('¡Pago procesado exitosamente!');
      navigate(`/factura/${reserva.codigoReserva || reserva.reservaId}`);
    } catch (err) {
      toast.error(err.backendMessage || 'Error al procesar el pago');
    } finally { setPagando(false); }
  };

  if (loading) return <LoadingSpinner text="Cargando checkout..." />;
  if (!reserva) return <div className="container page-padding"><p>Reserva no encontrada.</p></div>;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        <div className="checkout-layout">
          <div className="checkout-summary">
            <h2>Resumen de Reserva</h2>
            <div className="summary-card">
              <div className="summary-row"><span>Código</span><strong>{reserva.codigoReserva}</strong></div>
              <div className="summary-row"><span>Estado</span><StatusBadge status={reserva.estado} /></div>
              <div className="summary-row"><span>Check-in</span><span>{formatDate(reserva.fechaCheckIn)}</span></div>
              <div className="summary-row"><span>Check-out</span><span>{formatDate(reserva.fechaCheckOut)}</span></div>
              <div className="summary-row"><span>Huéspedes</span><span>{reserva.numAdultos} adultos, {reserva.numNinos} niños</span></div>
              <hr />
              <div className="summary-row"><span>Subtotal</span><span>{formatCurrency(reserva.subTotal)}</span></div>
              <div className="summary-row summary-total"><span>Total</span><strong>{formatCurrency(reserva.total)}</strong></div>
            </div>
          </div>

          <div className="checkout-payment">
            <h2>Método de Pago</h2>
            <div className="payment-card">
              {metodos.length === 0 ? (
                <p className="text-muted">No hay métodos de pago disponibles</p>
              ) : (
                <div className="payment-methods">
                  {metodos.map((m) => (
                    <label key={m.metodoPagoId} className={`payment-option ${Number(metodoId) === m.metodoPagoId ? 'selected' : ''}`}>
                      <input type="radio" name="metodo" value={m.metodoPagoId}
                        checked={Number(metodoId) === m.metodoPagoId}
                        onChange={(e) => setMetodoId(e.target.value)} />
                      <span>{m.tipo}</span>
                    </label>
                  ))}
                </div>
              )}
              <button className="btn btn-primary btn-block" onClick={handlePagar}
                disabled={pagando || !metodoId}>
                {pagando ? 'Procesando...' : `Pagar ${formatCurrency(reserva.total)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
