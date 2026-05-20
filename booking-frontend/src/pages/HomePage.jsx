import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlineMapPin, HiStar, HiOutlineShieldCheck, HiOutlineClock, HiOutlineHeart } from 'react-icons/hi2';
import { alojamientosApi } from '../api/alojamientos.api';
import { fotosApi } from '../api/fotos.api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StarRating from '../components/ui/StarRating';
import { formatCurrency, truncate } from '../utils/formatters';

export default function HomePage() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDestacadas = async () => {
      try {
        const { data } = await alojamientosApi.getAll();
        const lista = Array.isArray(data) ? data : [];
        // Cargar primera foto de cada propiedad
        const conFotos = await Promise.all(
          lista.slice(0, 6).map(async (prop) => {
            try {
              const fotosRes = await fotosApi.getByAlojamientoId(prop.alojamientoId);
              const fotos = Array.isArray(fotosRes.data) ? fotosRes.data : [];
              return { ...prop, fotoUrl: fotos[0]?.url || null };
            } catch {
              return { ...prop, fotoUrl: null };
            }
          })
        );
        setPropiedades(conFotos);
      } catch (err) {
        console.error('Error cargando propiedades destacadas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestacadas();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/propiedades?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="home-page">
      {/* ── Hero Section ───────────────────────────────── */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Encuentra tu alojamiento perfecto</h1>
          <p>Descubre hoteles, suites y estadías únicas en los mejores destinos</p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <HiOutlineMapPin size={20} />
              <input
                type="text"
                placeholder="¿A dónde vas? Ciudad, destino..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <HiOutlineMagnifyingGlass size={18} />
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <HiOutlineShieldCheck size={36} />
              <h3>Reserva segura</h3>
              <p>Tus datos protegidos con la mejor tecnología de encriptación</p>
            </div>
            <div className="feature-card">
              <HiOutlineClock size={36} />
              <h3>Confirmación instantánea</h3>
              <p>Recibe tu confirmación al instante después de reservar</p>
            </div>
            <div className="feature-card">
              <HiOutlineHeart size={36} />
              <h3>Mejores precios</h3>
              <p>Precios competitivos y transparentes sin cargos ocultos</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Propiedades Destacadas ─────────────────────── */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Propiedades Destacadas</h2>
            <Link to="/propiedades" className="btn btn-ghost">Ver todas →</Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Cargando propiedades..." />
          ) : propiedades.length === 0 ? (
            <p className="text-center text-muted">No hay propiedades disponibles aún.</p>
          ) : (
            <div className="properties-grid">
              {propiedades.map((prop) => (
                <Link
                  to={`/propiedades/${prop.alojamientoId}`}
                  key={prop.alojamientoId}
                  className="property-card"
                >
                  <div className="property-card-img">
                    {prop.fotoUrl ? (
                      <img src={prop.fotoUrl} alt={prop.nombre} loading="lazy" />
                    ) : (
                      <div className="property-card-placeholder">
                        <HiOutlineBuildingOffice2 size={48} />
                      </div>
                    )}
                    {prop.estrellas > 0 && (
                      <div className="property-card-stars">
                        <StarRating rating={prop.estrellas} size={14} />
                      </div>
                    )}
                  </div>
                  <div className="property-card-body">
                    <h3>{prop.nombre}</h3>
                    <p className="property-card-location">
                      <HiOutlineMapPin size={14} />
                      {prop.ciudad || prop.direccion}
                    </p>
                    <p className="property-card-desc">
                      {truncate(prop.descripcion, 80)}
                    </p>
                    {prop.calificacionPromedio > 0 && (
                      <div className="property-card-rating">
                        <HiStar size={14} className="star-filled" />
                        <span>{Number(prop.calificacionPromedio).toFixed(1)}</span>
                        <span className="text-muted">({prop.totalResenas} reseñas)</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
