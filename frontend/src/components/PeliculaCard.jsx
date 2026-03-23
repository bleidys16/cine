import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Ticket } from 'lucide-react';
import styles from './PeliculaCard.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getProxiedUrl = (url) => {
  if (!url) return null;
  if (url.includes('image.tmdb.org')) {
    const path = url.split('/w500/')[1] || url.split('/w342/')[1];
    if (path) return `${API}/tmdb/poster/${path}`;
  }
  return url;
};

const getFallback = (titulo) =>
  `https://placehold.co/300x450/111111/c9a84c?text=${encodeURIComponent(titulo.slice(0, 12))}`;

export default function PeliculaCard({ pelicula }) {
  const src = getProxiedUrl(pelicula.imagen_url) || getFallback(pelicula.titulo);
  const esPreventa = pelicula.estado === 'preventa';

  return (
    <Link to={`/pelicula/${pelicula.id}`} className={`card ${styles.card}`}>
      {/* Poster */}
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

        {/* Badge solo si es preventa */}
        {esPreventa && (
          <span className={styles.badgePreventa}>
            <Ticket size={9} /> Preventa
          </span>
        )}

        {/* Info en hover — aparece sobre la imagen */}
        <div className={styles.hoverInfo}>
          <p className={styles.hoverDesc}>{pelicula.descripcion}</p>
          <div className={styles.hoverMeta}>
            <span className={styles.hoverGenre}>{pelicula.genero}</span>
            <span className={styles.hoverClasif}>{pelicula.clasificacion}</span>
          </div>
        </div>
      </div>

      {/* Body — mínimo */}
      <div className={styles.body}>
        <h3 className={styles.titulo}>{pelicula.titulo}</h3>
        <div className={styles.footer}>
          <span className={styles.duracion}>
            <Clock size={11} /> {pelicula.duracion} min
          </span>
          <span className={styles.cta}>
            {esPreventa ? <><Ticket size={11} /> Preventa</> : <>Ver funciones <ChevronRight size={12} /></>}
          </span>
        </div>
      </div>
    </Link>
  );
}
