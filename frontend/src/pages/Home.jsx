import { useEffect, useState } from 'react';
import { Film, Search } from 'lucide-react';
import api from '../services/api';
import PeliculaCard from '../components/PeliculaCard';
import styles from './Home.module.css';

const GENEROS = ['Todos', 'Acción', 'Drama', 'Ciencia Ficción', 'Comedia', 'Terror', 'Musical', 'Romance'];

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

  const filtradas = peliculas.filter(p => {
    const matchBusq = p.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const matchGenero = genero === 'Todos' || p.genero === genero;
    return matchBusq && matchGenero;
  });

  return (
    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroTag}><Film size={14} /> Cartelera 2025</div>
            <h1 className={styles.heroTitle}>
              Vive la magia<br />del <span className={styles.heroAccent}>cine</span>
            </h1>
            <p className={styles.heroSub}>Selecciona tu película, elige tu asiento y disfruta de la mejor experiencia cinematográfica.</p>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className={styles.filtros}>
        <div className="container">
          <div className={styles.filtrosInner}>
            <div className={styles.searchWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                className={`input ${styles.searchInput}`}
                placeholder="Buscar película..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <div className={styles.generoTabs}>
              {GENEROS.map(g => (
                <button
                  key={g}
                  className={`${styles.generoTab} ${genero === g ? styles.active : ''}`}
                  onClick={() => setGenero(g)}
                >{g}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className={styles.grid}>
        <div className="container">
          {cargando ? (
            <div className={styles.loading}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
              <p>Cargando cartelera...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className={styles.empty}>
              <Film size={48} strokeWidth={1} />
              <p>No hay películas disponibles</p>
            </div>
          ) : (
            <div className={styles.cards}>
              {filtradas.map((p, i) => (
                <div key={p.id} className="fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                  <PeliculaCard pelicula={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
