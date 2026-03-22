import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import styles from './PeliculaCard.module.css';

const GENERO_COLORS = {
  'Ciencia Ficción': '#6366f1',
  'Drama':           '#a855f7',
  'Acción':          '#ef4444',
  'Musical':         '#ec4899',
  'Terror':          '#f97316',
  'Comedia':         '#22c55e',
  'Romance':         '#f43f5e',
  'Animación':       '#3b82f6',
  'Suspenso':        '#eab308',
  'Documental':      '#14b8a6',
};

// Usa el proxy de imágenes de OMDB (requiere solo el título)
const getPosterUrl = (pelicula) => {
  if (pelicula.imagen_url && pelicula.imagen_url.startsWith('https://image.tmdb.org')) {
    // Convertir a proxy confiable
    const path = pelicula.imagen_url.split('/p/')[1]; // ej: w342/abc123.jpg
    const filename = path?.split('/')[1]; // ej: abc123.jpg
    if (filename) return `https://image.tmdb.org/t/p/w500/${filename}`;
  }
  return pelicula.imagen_url || null;
};

const getFallback = (titulo) =>
  `https://placehold.co/300x450/1a1a1a/c9a84c?text=${encodeURIComponent(titulo.slice(0, 12))}`;

export default function PeliculaCard({ pelicula }) {
  const generoColor = GENERO_COLORS[pelicula.genero] || '#6b7280';
  const src = getPosterUrl(pelicula) || getFallback(pelicula.titulo);

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
        <Link to={`/pelicula/${pelicula.id}`} className={`btn btn-primary ${styles.cta}`}>
          Ver funciones <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}
