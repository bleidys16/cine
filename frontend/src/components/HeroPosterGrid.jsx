import styles from './HeroPosterGrid.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const proxy = (url) => {
  if (!url) return null;
  if (url.includes('image.tmdb.org')) {
    const path = url.split('/w500/')[1] || url.split('/w342/')[1];
    if (path) return `${API}/tmdb/poster/${path}`;
  }
  return url;
};

// Paths de respaldo — mismos que usan las cards exitosamente
const FALLBACK = [
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
].map(p => `${API}/tmdb/poster/${p}`);

export default function HeroPosterGrid({ peliculas = [] }) {
  // Usar las mismas URLs proxeadas que usan las cards — ya están en caché del browser
  const fromDB = peliculas
    .filter(p => p.imagen_url?.includes('image.tmdb.org'))
    .map(p => proxy(p.imagen_url))
    .filter(Boolean);

  const allPosters = [...fromDB, ...FALLBACK];
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
                loading={pi < 4 ? 'eager' : 'lazy'}
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
