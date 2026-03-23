import styles from './HeroPosterGrid.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Proxy de imagen TMDB a través del backend
const proxy = (path) => `${API}/tmdb/poster/${path}`;

// Paths verificados de TMDB (solo el path, sin dominio)
const FALLBACK_PATHS = [
  '8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', // Dune 2
  '8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // Oppenheimer
  '2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', // Gladiator II
  'iADOJ8Zymht2JPMoy3R7xceZprc.jpg', // Furiosa
  'kCGlIMHnOm8JPXNbFK0yFxMa5y9.jpg', // Poor Things
  'obRBIGMBRRz3MjBkkgmZdMsSHbR.jpg', // Hereditary
  'MXvBsmFKRGKbaDROUBPSl2K4g6.jpg',  // Saltburn
  'lqoMzCcZYEFK729d6qzt349fB4o.jpg', // The Substance
  'lurEK87kukWNaHd0zYnsi3yzJrs.jpg', // Anyone But You
  'H6vke7zGiuLsz4v4RPeReb9rsv.jpg',  // Challengers
  'hUu9zyZmKuCuitNKaBBgMBuSopx.jpg', // Zone of Interest
  'vBZ0qvaRxqEhZwl6LWmruJqWE8Z.jpg', // The Creator
];

export default function HeroPosterGrid({ peliculas = [] }) {
  // URLs de la BD pasadas por proxy
  const fromDB = peliculas
    .filter(p => p.imagen_url?.includes('image.tmdb.org'))
    .map(p => {
      const path = p.imagen_url.split('/w500/')[1] || p.imagen_url.split('/w342/')[1];
      return path ? proxy(path) : null;
    })
    .filter(Boolean);

  // Fallbacks también por proxy
  const fallbacks = FALLBACK_PATHS.map(proxy);

  // Combinar y tomar 16
  const allPosters = [...fromDB, ...fallbacks];
  const posters = [];
  for (let i = 0; posters.length < 16; i++) {
    posters.push(allPosters[i % allPosters.length]);
  }

  // Dividir en 4 columnas
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
                onError={e => { e.target.parentElement.style.background = '#1a1a1a'; e.target.style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
