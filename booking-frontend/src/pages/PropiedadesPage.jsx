import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { HiOutlineMapPin, HiOutlineMagnifyingGlass, HiStar, HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { alojamientosApi } from '../api/alojamientos.api';
import { fotosApi } from '../api/fotos.api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import StarRating from '../components/ui/StarRating';
import { truncate } from '../utils/formatters';
import { useDebounce } from '../hooks/useDebounce';

export default function PropiedadesPage() {
  const [searchParams] = useSearchParams();
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [error, setError] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data } = await alojamientosApi.getAll();
        const lista = Array.isArray(data) ? data : [];
        const conFotos = await Promise.all(
          lista.map(async (prop) => {
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
        console.error('Error cargando propiedades:', err);
        const msg = err?.response?.status
          ? `Error ${err.response.status}: No se pudo conectar con el servidor. Verifica que el backend esté activo.`
          : `Error de red: ${err.message || 'Sin conexión al servidor'}`;
        setError(msg);
        toast.error('No se pudo cargar las propiedades');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtradas = propiedades.filter((p) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.ciudad?.toLowerCase().includes(q) ||
      p.direccion?.toLowerCase().includes(q) ||
      p.descripcion?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="propiedades-page">
      <div className="container">
        <div className="page-header">
          <h1>Explorar Propiedades</h1>
          <div className="search-bar">
            <HiOutlineMagnifyingGlass size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Cargando propiedades..." />
        ) : error ? (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#fca5a5' }}>
            <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>⚠️ Error de conexión</p>
            <p style={{ fontSize: '0.9rem' }}>{error}</p>
            <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => { setError(null); setLoading(true); }}>Reintentar</button>
          </div>
        ) : filtradas.length === 0 ? (
          <EmptyState
            title="No se encontraron propiedades"
            description={
              debouncedSearch
                ? `No hay resultados para "${debouncedSearch}"`
                : 'Aún no hay propiedades registradas'
            }
          />
        ) : (
          <>
            <p className="results-count">{filtradas.length} propiedades encontradas</p>
            <div className="properties-grid">
              {filtradas.map((prop) => (
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
                    <p className="property-card-desc">{truncate(prop.descripcion, 80)}</p>
                    <div className="property-card-footer">
                      {prop.calificacionPromedio > 0 && (
                        <div className="property-card-rating">
                          <HiStar size={14} className="star-filled" />
                          <span>{Number(prop.calificacionPromedio).toFixed(1)}</span>
                        </div>
                      )}
                      <div className="property-card-amenities">
                        {prop.admiteMascotas && <span className="amenity-tag">🐾 Mascotas</span>}
                        {prop.tienePiscina && <span className="amenity-tag">🏊 Piscina</span>}
                        {prop.tieneParqueadero && <span className="amenity-tag">🅿️ Parqueo</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
