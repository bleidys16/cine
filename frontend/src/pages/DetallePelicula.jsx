import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, ArrowLeft, Users, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatFecha, formatHora } from '../utils/fecha.js';
import styles from './DetallePelicula.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getProxy = (url) => {
  if (!url?.includes('image.tmdb.org')) return url;
  const path = url.split('/w500/')[1] || url.split('/w342/')[1];
  return path ? `${API}/tmdb/poster/${path}` : url;
};

export default function DetallePelicula() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [pelicula, setPelicula] = useState(null);
  const [funciones, setFunciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/peliculas/${id}`),
      api.get(`/funciones/pelicula/${id}`)
    ]).then(([p, f]) => {
      setPelicula(p.data);
      setFunciones(f.data);
    }).catch(console.error)
      .finally(() => setCargando(false));
  }, [id]);

  const handleComprar = (funcion) => {
    if (!usuario) { navigate('/login'); return; }
    navigate(`/comprar/${funcion.id}`);
  };

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (!pelicula) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
      Película no encontrada
    </div>
  );

  const imgSrc = getProxy(pelicula.imagen_url) || `https://placehold.co/400x600/111/555?text=${encodeURIComponent(pelicula.titulo)}`;

  return (
    <main className={styles.main}>
      <div className={styles.backdrop}>
        <img src={imgSrc} alt="" />
        <div className={styles.backdropOverlay} />
      </div>

      <div className={`container ${styles.content}`}>
        <button className={`btn btn-ghost ${styles.back}`} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Volver
        </button>

        {/* Info película */}
        <div className={styles.info}>
          <div className={styles.poster}>
            <img src={imgSrc} alt={pelicula.titulo}
              onError={e => e.target.src = `https://placehold.co/400x600/111/555?text=${encodeURIComponent(pelicula.titulo)}`}
            />
          </div>
          <div className={styles.details}>
            <h1 className={styles.titulo}>{pelicula.titulo}</h1>
            <div className={styles.meta}>
              <span className="tag"><Clock size={12} /> {pelicula.duracion} min</span>
              <span className="tag">{pelicula.genero}</span>
              <span className="badge badge-gray">{pelicula.clasificacion}</span>
            </div>
            <p className={styles.desc}>{pelicula.descripcion}</p>
          </div>
        </div>

        {/* Funciones */}
        <h2 className={styles.secTitle}>Funciones disponibles</h2>

        {funciones.length === 0 ? (
          <div className={styles.noFunciones}>
            <p>No hay funciones programadas para esta película</p>
          </div>
        ) : (
          <div className={styles.funciones}>
            {funciones.map(f => (
              <div key={f.id} className={`card ${styles.funcionCard}`} onClick={() => handleComprar(f)}>
                <div className={styles.funcionInfo}>
                  <div className={styles.funcionFechaHora}>
                    <span className={styles.funcionFecha}>
                      {formatFecha(f.fecha, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    <span className={styles.funcionHora}>{formatHora(f.hora)}</span>
                  </div>
                  <div className={styles.funcionMeta}>
                    <span className="tag"><MapPin size={11} /> {f.sala}</span>
                  </div>
                </div>

                <div className={styles.funcionRight}>
                  <div className={styles.disponibles}>
                    <span className={styles.disponiblesNum}>{f.asientos_disponibles}</span>
                    asientos libres
                  </div>
                  <div className={styles.precio}>
                    <span className={styles.precioLabel}>por asiento</span>
                    <span className={styles.precioVal}>${Number(f.precio).toLocaleString('es-CO')}</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    disabled={f.asientos_disponibles === 0}
                    onClick={e => { e.stopPropagation(); handleComprar(f); }}
                  >
                    {f.asientos_disponibles === 0 ? 'Agotado' : <>Comprar <ChevronRight size={14} /></>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
