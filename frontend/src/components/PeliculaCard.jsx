import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Ticket } from 'lucide-react';
import styles from './PeliculaCard.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const GENERO_COLORS = {
  'Ciencia Ficción': '#6366f1', 'Drama': '#a855f7', 'Acción': '#ef4444',
  'Musical': '#ec4899', 'Terror': '#f97316', 'Comedia': '#22c55e',
  'Romance': '#f43f5e', 'Animación': '#3b82f6', 'Suspenso': '#eab308', 'Documental': '#14b8a6',
};

const getProxiedUrl = (url) => {
  if (!url) return null;
  if (url.includes('image.tmdb.org')) {
    const path = url.split('/w500/')[1] || url.split('/w342/')[1];
    if (path) return `${API}/tmdb/poster/${path}`;
  }
  return url;
};

const getFallback = (titulo) =>
  `https://placehold.co/300x450/111111/c9a84c?text=${encodeURIComponent(titulo.slice(0, 14))}`;

export default function PeliculaCard({ pelicula }) {
  const generoColor = GENERO_COLORS[pelicula.genero] || '#6b7280';
  const src = getProxiedUrl(pelicula.imagen_url) || getFallback(pelicula.titulo);
  const esPreventa = pelicula.estado === 'preventa';

  return (
    <div className={`card card-hover ${styles.card}`}>
      <div className={styles.imgWrap}>
        <img
          src={src}
          alt={pelicula.titulo}
          className={styles.img}
          loading="lazy"
          onError={(e) => {
            if (!e.target.dataset.fallback) {
              e.target.dataset.fallback = 'true';
              e.target.src = getFallback(pelicula.titulo);
            }
          }}
        />
        <div className={styles.overlay} />
        {esPreventa && <span className={styles.badgePreventa}><Ticket size={9} /> Preventa</span>}
        <span className={styles.clasificacion}>{pelicula.clasificacion}</span>
        <div className={styles.genrePill} style={{ background: `${generoColor}22`, color: generoColor, border: `1px solid ${generoColor}44` }}>
          {pelicula.genero}
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.titulo}>{pelicula.titulo}</h3>
        <p className={styles.desc}>{pelicula.descripcion}</p>
        <div className={styles.meta}>
          <span className="tag"><Clock size={11} /> {pelicula.duracion} min</span>
        </div>
        <Link
          to={`/pelicula/${pelicula.id}`}
          className={`btn btn-primary ${styles.cta} ${esPreventa ? styles.ctaPreventa : ''}`}
        >
          {esPreventa ? <><Ticket size={13} /> Comprar preventa</> : <>Ver funciones <ChevronRight size={13} /></>}
        </Link>
      </div>
    </div>
  );
}
