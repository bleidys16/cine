import styles from './HeroPosterGrid.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// wsrv.nl es un CDN proxy gratuito que no duerme — ideal para el hero decorativo
// Para las cards usamos el proxy del backend porque necesitan mejor calidad
const cdnProxy = (path) =>
  `https://wsrv.nl/?url=image.tmdb.org/t/p/w342/${path}&w=200&output=webp&q=70`;

const backendProxy = (url) => {
  if (!url?.includes('image.tmdb.org')) return url;
  const path = url.split('/w500/')[1] || url.split('/w342/')[1];
  return path ? `${API}/tmdb/poster/${path}` : url;
};

const FALLBACK_PATHS = [
  'iADOJ8Zymht2JPMoy3R7xceZprc.jpg',
  'kCGlIMHnOm8JPXNbFK0yFxMa5y9.jpg',
  '8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  'obRBIGMBRRz3MjBkkgmZdMsSHbR.jpg',
  'MXvBsmFKRGKbaDROUBPSl2K4g6.jpg',
  'lqoMzCcZYEFK729d6qzt349fB4o.jpg',
  'lurEK87kukWNaHd0zYnsi3yzJrs.jpg',
  'H6vke7zGiuLsz4v4RPeReb9rsv.jpg',
  'hUu9zyZmKuCuitNKaBBgMBuSopx.jpg',
  'vBZ0qvaRxqEhZwl6LWmruJqWE8Z.jpg',
  '8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  '2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
];

export default function HeroPosterGrid({ peliculas = [] }) {
  const fromDB = peliculas
    .filter(p => p.imagen_url?.includes('image.tmdb.org'))
    .map(p => {
      const path = p.imagen_url.split('/w500/')[1] || p.imagen_url.split('/w342/')[1];
      return path ? cdnProxy(path) : null;
    })
    .filter(Boolean);

  const fallbacks = FALLBACK_PATHS.map(cdnProxy);
  const allPosters = [...fromDB, ...fallbacks];
  const posters = Array.from({ length: 16 }, (_, i) => allPosters[i % allPosters.length]);

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
                loading={pi < 8 ? 'eager' : 'lazy'}
                onError={e => {
                  // Si wsrv.nl falla, intentar con backend proxy
                  if (!e.target.dataset.fallback) {
                    e.target.dataset.fallback = 'true';
                    const path = src.split('w342/')[1]?.split('&')[0];
                    if (path) e.target.src = `${API}/tmdb/poster/${path}`;
                  } else {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = '#161616';
                  }
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
