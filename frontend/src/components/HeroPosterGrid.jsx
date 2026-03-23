import styles from './HeroPosterGrid.module.css';

// Para el hero usamos TMDB directo — son decorativas, no importa si alguna falla
// El proxy solo es necesario para las cards donde la imagen es protagonista
const TMDB = 'https://image.tmdb.org/t/p/w342';

const FALLBACK_PATHS = [
  '8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  '8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  '2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
  'iADOJ8Zymht2JPMoy3R7xceZprc.jpg',
  'kCGlIMHnOm8JPXNbFK0yFxMa5y9.jpg',
  'obRBIGMBRRz3MjBkkgmZdMsSHbR.jpg',
  'MXvBsmFKRGKbaDROUBPSl2K4g6.jpg',
  'lqoMzCcZYEFK729d6qzt349fB4o.jpg',
  'lurEK87kukWNaHd0zYnsi3yzJrs.jpg',
  'H6vke7zGiuLsz4v4RPeReb9rsv.jpg',
  'hUu9zyZmKuCuitNKaBBgMBuSopx.jpg',
  'vBZ0qvaRxqEhZwl6LWmruJqWE8Z.jpg',
];

export default function HeroPosterGrid({ peliculas = [] }) {
  // URLs de la BD — extraer solo el path y usar TMDB directo
  const fromDB = peliculas
    .filter(p => p.imagen_url?.includes('image.tmdb.org'))
    .map(p => {
      const path = p.imagen_url.split('/w500/')[1] || p.imagen_url.split('/w342/')[1];
      return path ? `${TMDB}/${path}` : null;
    })
    .filter(Boolean);

  const fallbacks = FALLBACK_PATHS.map(p => `${TMDB}/${p}`);
  const allPosters = [...fromDB, ...fallbacks];

  // Asegurar 16 posters
  const posters = Array.from({ length: 16 }, (_, i) => allPosters[i % allPosters.length]);

  // 4 columnas
  const cols = [[], [], [], []];
  posters.forEach((src, i) => cols[i % 4].push(src));

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
                loading="lazy"
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
