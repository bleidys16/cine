import { Link } from 'react-router-dom';
import { Clock, Star, ChevronRight } from 'lucide-react';
import styles from './PeliculaCard.module.css';

const GENERO_COLORS = {
  'Ciencia Ficción': '#4b9de8',
  'Drama': '#9b4be8',
  'Acción': '#e84b4b',
  'Musical': '#e84bbc',
  'Terror': '#e87a4b',
  'Comedia': '#4be87a',
  'Romance': '#e84b7a',
};

export default function PeliculaCard({ pelicula }) {
  const generoColor = GENERO_COLORS[pelicula.genero] || '#8892a4';
  const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(pelicula.titulo)}&background=111620&color=e8b84b&size=400`;

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.imgWrap}>
        <img
          src={pelicula.imagen_url || fallbackImg}
          alt={pelicula.titulo}
          className={styles.img}
          onError={(e) => { e.target.src = fallbackImg; }}
        />
        <div className={styles.overlay} />
        <span className={styles.clasificacion}>{pelicula.clasificacion}</span>
        <div className={styles.genrePill} style={{ background: `${generoColor}20`, color: generoColor, border: `1px solid ${generoColor}40` }}>
          {pelicula.genero}
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.titulo}>{pelicula.titulo}</h3>
        <p className={styles.desc}>{pelicula.descripcion?.slice(0, 90)}...</p>
        <div className={styles.meta}>
          <span className="tag"><Clock size={12} /> {pelicula.duracion} min</span>
        </div>
        <Link to={`/pelicula/${pelicula.id}`} className={`btn btn-primary ${styles.cta}`}>
          Ver funciones <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
