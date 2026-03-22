import styles from './HeroPosterGrid.module.css';

// Posters de respaldo hardcodeados para que siempre haya contenido
const FALLBACK_POSTERS = [
  'https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  'https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  'https://image.tmdb.org/t/p/w300/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
  'https://image.tmdb.org/t/p/w300/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg',
  'https://image.tmdb.org/t/p/w300/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
  'https://image.tmdb.org/t/p/w300/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
  'https://image.tmdb.org/t/p/w300/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
  'https://image.tmdb.org/t/p/w300/oIOiFFpJJIGNIpf0lFHsYMqjJNW.jpg',
  // repetir para llenar el grid
  'https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  'https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  'https://image.tmdb.org/t/p/w300/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
  'https://image.tmdb.org/t/p/w300/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg',
  'https://image.tmdb.org/t/p/w300/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
  'https://image.tmdb.org/t/p/w300/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
  'https://image.tmdb.org/t/p/w300/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
  'https://image.tmdb.org/t/p/w300/oIOiFFpJJIGNIpf0lFHsYMqjJNW.jpg',
];

export default function HeroPosterGrid({ peliculas = [] }) {
  // Combinar posters de la BD con los de respaldo
  const fromDB = peliculas
    .filter(p => p.imagen_url)
    .map(p => p.imagen_url);

  const posters = [...fromDB, ...FALLBACK_POSTERS].slice(0, 16);

  // Dividir en 4 columnas
  const cols = [[], [], [], []];
  posters.forEach((src, i) => cols[i % 4].push(src));

  return (
    <div className={styles.grid} aria-hidden="true">
      {cols.map((col, ci) => (
        <div key={ci} className={`${styles.col} ${ci % 2 === 1 ? styles.colOffset : ''}`}>
          {/* Duplicar para scroll continuo */}
          {[...col, ...col].map((src, pi) => (
            <div key={pi} className={styles.posterWrap}>
              <img
                src={src}
                alt=""
                className={styles.poster}
                loading="lazy"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
