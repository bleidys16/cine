import { useEffect, useState } from 'react';
import { Ticket, Film, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import styles from './Preventa.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const proxy = (url) => {
  if (!url) return null;
  if (url.includes('image.tmdb.org')) {
    const path = url.split('/w500/')[1] || url.split('/w342/')[1];
    if (path) return `${API}/tmdb/poster/${path}`;
  }
  return url;
};

const getFallback = (titulo) =>
  `https://placehold.co/400x600/111111/c9a84c?text=${encodeURIComponent(titulo.slice(0, 12))}`;

export default function Preventa() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/peliculas')
      .then(r => setPeliculas(r.data.filter(p => p.estado === 'preventa')))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className={styles.main}>
      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <div className={styles.badge}>
              <Ticket size={14} /> Preventa
            </div>
            <h1 className={styles.title}>Próximamente en cines</h1>
            <p className={styles.sub}>
              Asegura tus asientos antes que todos. Compra tu tiquete de preventa y disfruta de los próximos estrenos.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        {cargando ? (
          <div className={styles.loading}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
            <p>Cargando próximos estrenos...</p>
          </div>
        ) : peliculas.length === 0 ? (
          <div className={styles.empty}>
            <Film size={56} strokeWidth={1} />
            <h3>No hay preventa disponible</h3>
            <p>Pronto anunciaremos nuevos estrenos</p>
            <Link to="/" className="btn btn-outline" style={{ marginTop: 8 }}>
              Ver cartelera actual
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {peliculas.map((p, i) => (
              <div key={p.id} className={`card ${styles.card} fade-in`} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={styles.imgWrap}>
                  <img
                    src={proxy(p.imagen_url) || getFallback(p.titulo)}
                    alt={p.titulo}
                    className={styles.img}
                    onError={e => { if (!e.target.dataset.fallback) { e.target.dataset.fallback = 'true'; e.target.src = getFallback(p.titulo); } }}
                  />
                  <div className={styles.imgOverlay} />
                  <span className={styles.clasificacion}>{p.clasificacion}</span>
                  <span className={styles.preventaBadge}><Ticket size={10} /> Preventa</span>
                </div>
                <div className={styles.body}>
                  <div className={styles.genrePill}>{p.genero}</div>
                  <h2 className={styles.titulo}>{p.titulo}</h2>
                  <p className={styles.desc}>{p.descripcion}</p>
                  <div className={styles.meta}>
                    <span className="tag"><Clock size={12} /> {p.duracion} min</span>
                  </div>
                  <Link to={`/pelicula/${p.id}`} className={`btn btn-primary ${styles.cta}`}>
                    <Ticket size={15} /> Comprar preventa <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
