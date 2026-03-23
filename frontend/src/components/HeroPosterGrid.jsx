import styles from './HeroPosterGrid.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getProxy = (url) => {
  if (!url?.includes('image.tmdb.org')) return null;
  const path = url.split('/w500/')[1] || url.split('/w342/')[1];
  return path ? `${API}/tmdb/poster/${path}` : null;
};

export default function HeroPosterGrid({ peliculas = [] }) {
  // Solo usar imágenes que ya están en la BD y funcionan
  const posters = peliculas
    .filter(p => p.imagen_url?.includes('image.tmdb.org'))
    .map(p => getProxy(p.imagen_url))
    .filter(Boolean);

  if (posters.length === 0) return <div className={styles.grid} />;

  // Repetir hasta tener 16
  const filled = Array.from({ length: 16 }, (_, i) => posters[i % posters.length]);

  const cols = [[], [], [], []];
  filled.forEach((src, i) => cols[i % 4].push(src));

  return (
    <div className={styles.grid} aria-hidden="true">
      {cols.map((col, ci) => (
        <div key={ci} className={`${styles.col} ${ci % 2 === 1 ? styles.colOffset : ''}`}>
          {[...col, ...col].map((src, pi) => (
            <div key={pi} className={styles.posterWrap}>
              <img
                src={src}
                alt=""
                className={styles.poster}
                loading={pi < 8 ? 'eager' : 'lazy'}
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = '#161616';
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
