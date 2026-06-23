import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineMapPin, HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineCalendarDays, HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { alojamientosApi } from '../api/alojamientos.api';
import { habitacionesApi } from '../api/habitaciones.api';
import { fotosApi } from '../api/fotos.api';
import { calendarioApi } from '../api/calendario.api';
import { reservasApi } from '../api/reservas.api';
import { clientesApi } from '../api/clientes.api';
import useAuthStore from '../stores/useAuthStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StarRating from '../components/ui/StarRating';
import { formatCurrency, calcularNoches } from '../utils/formatters';
import { isValidDateRange, isFutureDate } from '../utils/validators';

export default function PropiedadDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getClienteId, user } = useAuthStore();

  // Resuelve el clienteId del usuario logueado.
  // Si no viene en el token (usuario real del backend), lo busca por email.
  const resolveClienteId = async () => {
    const stored = getClienteId();
    if (stored) return stored;
    if (!user?.email) return null;
    try {
      // Intenta buscar cliente por email usando getAll con filtro
      // El contrato expone GET /clientes-lucano que devuelve lista
      const { data } = await clientesApi.getAll({ nombre: user.email });
      const lista = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      const encontrado = lista.find(c => c.email === user.email);
      return encontrado?.clienteId ?? null;
    } catch {
      return null;
    }
  };

  const [propiedad, setPropiedad] = useState(null);
  const [habitaciones, setHabitaciones] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [fotoActual, setFotoActual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reservando, setReservando] = useState(false);

  const [form, setForm] = useState({
    habitacionId: '',
    fechaCheckIn: '',
    fechaCheckOut: '',
    numAdultos: 1,
    numNinos: 0,
    llevaMascotas: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, habRes, fotRes] = await Promise.all([
          alojamientosApi.getById(id),
          habitacionesApi.getByAlojamientoId(id),
          fotosApi.getByAlojamientoId(id),
        ]);
        setPropiedad(propRes.data);
        const habs = Array.isArray(habRes.data) ? habRes.data : [];
        setHabitaciones(habs);
        setFotos(Array.isArray(fotRes.data) ? fotRes.data : []);
        if (habs.length > 0) {
          setForm((prev) => ({ ...prev, habitacionId: habs[0].habitacionId }));
        }
      } catch (err) {
        console.error('Error cargando propiedad:', err);
        toast.error('No se pudo cargar la propiedad');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const selectedHab = habitaciones.find(
    (h) => h.habitacionId === Number(form.habitacionId)
  );
  const noches = calcularNoches(form.fechaCheckIn, form.fechaCheckOut);
  const subtotal = selectedHab ? selectedHab.precioNoche * noches : 0;

  const handleReservar = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para reservar');
      navigate('/login');
      return;
    }

    if (!form.habitacionId || !form.fechaCheckIn || !form.fechaCheckOut) {
      toast.error('Completa todos los campos de la reserva');
      return;
    }

    if (!isFutureDate(form.fechaCheckIn)) {
      toast.error('La fecha de check-in debe ser futura');
      return;
    }

    if (!isValidDateRange(form.fechaCheckIn, form.fechaCheckOut)) {
      toast.error('El check-out debe ser posterior al check-in');
      return;
    }

    if (selectedHab) {
      if (Number(form.numAdultos) > selectedHab.capacidadAdultos) {
        toast.error(`La habitación seleccionada admite máximo ${selectedHab.capacidadAdultos} adulto(s).`);
        return;
      }
      if (Number(form.numNinos) > selectedHab.capacidadNinos) {
        toast.error(`La habitación seleccionada admite máximo ${selectedHab.capacidadNinos} niño(s).`);
        return;
      }
    }

    // ── Verificación de conflictos EN EL SERVIDOR (funciona entre dispositivos) ──
    try {
      const clienteId = await resolveClienteId();
      if (clienteId) {
        const { data: reservasExistentes } = await reservasApi.getByClienteId(clienteId);
        const reservasActivas = Array.isArray(reservasExistentes)
          ? reservasExistentes.filter(r => r.estado !== 'Cancelada' && r.estado !== 'Rechazada')
          : [];

        const checkIn = new Date(form.fechaCheckIn);
        const checkOut = new Date(form.fechaCheckOut);

        const conflicto = reservasActivas.some(r => {
          // Verificar si alguna reserva activa tiene la misma habitación y fechas solapadas
          const tieneHabitacion = Array.isArray(r.habitaciones)
            ? r.habitaciones.some(h => h.habitacionId === Number(form.habitacionId))
            : r.alojamientoId === Number(id); // fallback: mismo alojamiento

          const solapamiento =
            checkIn < new Date(r.fechaCheckOut) &&
            checkOut > new Date(r.fechaCheckIn);

          return tieneHabitacion && solapamiento;
        });

        if (conflicto) {
          toast.error('⚠️ Ya tienes una reserva activa para esta habitación en esas fechas. No puedes hacer una reserva duplicada.');
          return;
        }
      }
    } catch (errConflicto) {
      console.warn('No se pudo verificar conflictos en el servidor:', errConflicto);
      // Si falla la verificación, continuamos — el backend puede rechazarlo
    }

    setReservando(true);
    try {
      // Resolver clienteId — puede no venir directo si el backend no lo incluyó en el JWT
      const clienteId = await resolveClienteId();
      if (!clienteId) {
        toast.error('No se pudo identificar tu cuenta de cliente. Si eres administrador, no puedes hacer reservas.');
        setReservando(false);
        return;
      }

      const nochesCalculadas = Math.max(1, noches); // Siempre al menos 1 noche

      const payload = {
        clienteId: Number(clienteId),
        alojamientoId: Number(id),
        fechaCheckIn: form.fechaCheckIn,
        fechaCheckOut: form.fechaCheckOut,
        numAdultos: Number(form.numAdultos),
        numNinos: Number(form.numNinos),
        llevaMascotas: form.llevaMascotas,
        habitaciones: [
          {
            habitacionId: Number(form.habitacionId),
            precioPorNoche: selectedHab ? Number(selectedHab.precioNoche) : 0,
            numNoches: nochesCalculadas
          }
        ]
      };

      console.log('[Reserva] Payload enviado:', JSON.stringify(payload, null, 2));
      const { data } = await reservasApi.crear(payload);
      toast.success('¡Reserva creada exitosamente!');
      
      // Guardar reserva localmente para evitar solapamientos futuros
      try {
        const storedSlots = JSON.parse(localStorage.getItem('booked_slots') || '[]');
        storedSlots.push({
          habitacionId: Number(form.habitacionId),
          fechaCheckIn: form.fechaCheckIn,
          fechaCheckOut: form.fechaCheckOut
        });
        localStorage.setItem('booked_slots', JSON.stringify(storedSlots));
      } catch (errStore) {
        console.error('Error al persistir la reserva en el caché local:', errStore);
      }

      navigate(`/checkout/${data.reservaId}`);
    } catch (err) {
      toast.error(err.backendMessage || 'Error al crear la reserva');
    } finally {
      setReservando(false);
    }
  };

  const handlePrevFoto = () => {
    setFotoActual((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  };

  const handleNextFoto = () => {
    setFotoActual((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <LoadingSpinner text="Cargando propiedad..." />;
  if (!propiedad) return <div className="container"><p>Propiedad no encontrada.</p></div>;

  return (
    <div className="detalle-page">
      <div className="container">
        {/* ── Galería Interactiva ──────────────────────── */}
        <div className="detalle-gallery">
          {fotos.length > 0 ? (
            <div className="gallery-container-interactive">
              <div className="gallery-main-interactive">
                <img src={fotos[fotoActual]?.url} alt={propiedad.nombre} />
                
                {fotos.length > 1 && (
                  <>
                    <button className="gallery-nav-btn prev" onClick={handlePrevFoto} aria-label="Foto anterior">
                      &lsaquo;
                    </button>
                    <button className="gallery-nav-btn next" onClick={handleNextFoto} aria-label="Siguiente foto">
                      &rsaquo;
                    </button>
                  </>
                )}
              </div>
              
              {fotos.length > 1 && (
                <div className="gallery-dots">
                  {fotos.map((_, idx) => (
                    <button
                      key={idx}
                      className={`gallery-dot ${idx === fotoActual ? 'active' : ''}`}
                      onClick={() => setFotoActual(idx)}
                      aria-label={`Ir a foto ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="gallery-placeholder-dark">
              <HiOutlineBuildingOffice2 size={64} />
              <p>Sin fotos disponibles</p>
            </div>
          )}
        </div>

        <div className="detalle-content">
          {/* ── Info Principal ───────────────────────── */}
          <div className="detalle-info">
            <div className="detalle-header">
              <h1>{propiedad.nombre}</h1>
              {propiedad.estrellas > 0 && (
                <StarRating rating={propiedad.estrellas} size={20} />
              )}
            </div>

            <p className="detalle-location">
              <HiOutlineMapPin size={16} />
              {propiedad.ciudad && `${propiedad.ciudad} — `}
              {propiedad.direccion}
            </p>

            {propiedad.descripcion && (
              <div className="detalle-description">
                <h3>Descripción</h3>
                <p>{propiedad.descripcion}</p>
              </div>
            )}

            <div className="detalle-amenities">
              <h3>Servicios</h3>
              <div className="amenities-list">
                {propiedad.admiteMascotas && <span className="amenity-tag">🐾 Mascotas</span>}
                {propiedad.tienePiscina && <span className="amenity-tag">🏊 Piscina</span>}
                {propiedad.tieneParqueadero && <span className="amenity-tag">🅿️ Parqueadero</span>}
              </div>
            </div>

            {/* ── Habitaciones ─────────────────────── */}
            <div className="detalle-rooms">
              <h3>Habitaciones disponibles</h3>
              {habitaciones.length === 0 ? (
                <p className="text-muted">No hay habitaciones registradas.</p>
              ) : (
                <div className="rooms-grid">
                  {habitaciones.map((hab) => (
                    <div
                      key={hab.habitacionId}
                      className={`room-card ${
                        Number(form.habitacionId) === hab.habitacionId ? 'selected' : ''
                      }`}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, habitacionId: hab.habitacionId }))
                      }
                    >
                      <h4>{hab.nombre}</h4>
                      <p className="room-desc">{hab.descripcion}</p>
                      <div className="room-details">
                        <span><HiOutlineUsers size={14} /> {hab.capacidadAdultos} adultos, {hab.capacidadNinos} niños</span>
                        <span>{hab.numDormitorios} dorm. · {hab.numBanos} baño(s)</span>
                        {hab.superficieM2 > 0 && <span>{hab.superficieM2} m²</span>}
                      </div>
                      <div className="room-price">
                        <HiOutlineCurrencyDollar size={16} />
                        <strong>{formatCurrency(hab.precioNoche)}</strong>
                        <span>/ noche</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar Reserva ──────────────────────── */}
          <aside className="detalle-sidebar">
            <div className="booking-card">
              <h3>Reservar</h3>

              <form onSubmit={handleReservar}>
                <div className="form-group">
                  <label>Habitación</label>
                  <select
                    value={form.habitacionId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, habitacionId: e.target.value }))
                    }
                  >
                    {habitaciones.map((h) => (
                      <option key={h.habitacionId} value={h.habitacionId}>
                        {h.nombre} — {formatCurrency(h.precioNoche)}/noche
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><HiOutlineCalendarDays size={14} /> Check-in</label>
                    <input
                      type="date"
                      value={form.fechaCheckIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, fechaCheckIn: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label><HiOutlineCalendarDays size={14} /> Check-out</label>
                    <input
                      type="date"
                      value={form.fechaCheckOut}
                      min={form.fechaCheckIn || new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, fechaCheckOut: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Adultos</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedHab?.capacidadAdultos || 10}
                      value={form.numAdultos}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, numAdultos: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Niños</label>
                    <input
                      type="number"
                      min="0"
                      max={selectedHab?.capacidadNinos || 5}
                      value={form.numNinos}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, numNinos: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.llevaMascotas}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, llevaMascotas: e.target.checked }))
                      }
                    />
                    Llevo mascotas
                  </label>
                </div>

                {noches > 0 && selectedHab && (
                  <div className="booking-summary">
                    <div className="summary-row">
                      <span>{formatCurrency(selectedHab.precioNoche)} × {noches} noches</span>
                      <strong>{formatCurrency(subtotal)}</strong>
                    </div>
                    <hr />
                    <div className="summary-row summary-total">
                      <span>Total</span>
                      <strong>{formatCurrency(subtotal)}</strong>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={reservando || habitaciones.length === 0}
                >
                  {reservando ? 'Procesando...' : 'Reservar ahora'}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
