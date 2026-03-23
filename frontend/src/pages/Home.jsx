import { useEffect, useState } from 'react';
import { Film, Search } from 'lucide-react';
import api from '../services/api';
import PeliculaCard from '../components/PeliculaCard';
import HeroPosterGrid from '../components/HeroPosterGrid';
import styles from './Home.module.css';

const GENEROS = ['Todos', 'Acción', 'Drama', 'Ciencia Ficción', 'Comedia', 'Terror', 'Musical', 'Romance', 'Animación'];

export default function Home() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [genero, setGenero] = useState('Todos');

  useEffect(() => {
    api.get('/peliculas')
      .then(r => setPeliculas(r.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  // Solo películas activas en cartelera (sin preventa)
  const enCartelera = peliculas.filter(p => p.estado === 'activa');

  const filtradas = enCartelera.filter(p => {
    const matchBusq = p.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const matchGenero = genero === 'Todos' || p.genero === genero;
    return matchBusq && matchGenero;
  });

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <HeroPosterGrid peliculas={peliculas} />
        <div className={styles.heroOverlay} />
        <div className="container">
          <div className={styles.heroContent}>
<h1 className={styles.heroTitle}>
              Vive la magia<br />del <span className={styles.heroAccent}>cine</span>
            </h1>
            <p className={styles.heroSub}>
              Selecciona tu película, elige tu asiento y disfruta de la mejor experiencia cinematográfica.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.filters}>
        <div className="container">
          <div className={styles.filtersInner}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={`input ${styles.searchInput}`}
                placeholder="Buscar película..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <div className={styles.genreTabs}>
              {GENEROS.map(g => (
                <button key={g} className={`${styles.genreTab} ${genero === g ? styles.active : ''}`} onClick={() => setGenero(g)}>{g}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <div className="container">
          {cargando ? (
            <div className={styles.loading}>
              <div className="spinner" style={{ width: 36, height: 36 }} />
              <p>Cargando cartelera...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className={styles.empty}>
              <Film size={44} strokeWidth={1} />
              <p>No hay películas disponibles</p>
            </div>
          ) : (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>En cartelera</h2>
                <div className={styles.sectionLine} />
                <span className={styles.sectionCount}>{filtradas.length} películas</span>
              </div>
              <div className={styles.cards}>
                {filtradas.map((p, i) => (
                  <div key={p.id} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <PeliculaCard pelicula={p} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
