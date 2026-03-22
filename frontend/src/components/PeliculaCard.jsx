import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import styles from './PeliculaCard.module.css';

const GENERO_COLORS = {
  'Ciencia Ficción': '#6366f1',
  'Drama': '#a855f7',
  'Acción': '#ef4444',
  'Musical': '#ec4899',
  'Terror': '#f97316',
  'Comedia': '#22c55e',
  'Romance': '#f43f5e',
  'Animación': '#3b82f6',
  'Suspenso': '#eab308',
  'Documental': '#14b8a6',
};

// Poster de respaldo usando DiceBear — genera imagen única por título
const getFallbackImg = (titulo) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(titulo.slice(0,2))}&background=1a1a1a&color=c9a84c&size=400&bold=true&font-size=0.4`;

export default function PeliculaCard({ pelicula }) {
  const generoColor = GENERO_COLORS[pelicula.genero] || '#6b7280';

  return (
    <div className={`card card-hover ${styles.card}`}>
      <div className={styles.imgWrap}>
        <img
          src={pelicula.imagen_url || getFallbackImg(pelicula.titulo)}
          alt={pelicula.titulo}
          className={styles.img}
          loading="lazy"
          onError={(e) => {
            if (!e.target.dataset.fallback) {
              e.target.dataset.fallback = 'true';
              e.target.src = getFallbackImg(pelicula.titulo);
            }
          }}
        />
        <div className={styles.overlay} />
        <span className={styles.clasificacion}>{pelicula.clasificacion}</span>
        <div
          className={styles.genrePill}
          style={{
            background: `${generoColor}22`,
            color: generoColor,
            border: `1px solid ${generoColor}44`
          }}
        >
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
