import { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const [mostrarAutocomplete, setMostrarAutocomplete] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    api.get('/peliculas')
      .then(r => setPeliculas(r.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    const handleClickFuera = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMostrarAutocomplete(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

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
            <h1 className={styles.heroTitle}>Tu próxima<br />película favorita<br />te está esperando</h1>
            <p className={styles.heroSub}>Compra tus tiquetes en segundos, elige tu asiento y disfruta.</p>
          </div>
        </div>
      </section>

      <section className={styles.filters}>
        <div className="container">
          <div className={styles.filtersInner}>
            <div className={styles.searchWrap} ref={searchRef}>
              <Search size={14} className={styles.searchIcon} />
              <input
                className={`input ${styles.searchInput}`}
                placeholder="Buscar película..."
                value={busqueda}
                onChange={e => {
                  setBusqueda(e.target.value);
                  setMostrarAutocomplete(true);
                }}
                onFocus={() => setMostrarAutocomplete(true)}
              />
              
              {mostrarAutocomplete && busqueda.trim() !== '' && filtradas.length > 0 && (
                <div className={styles.autocompleteDropdown}>
                  {filtradas.slice(0, 5).map(p => (
                    <Link 
                      to={`/pelicula/${p.id}`} 
                      key={p.id} 
                      className={styles.autocompleteItem}
                      onClick={() => setMostrarAutocomplete(false)}
                    >
                      <div className={styles.autocompleteInfo}>
                        <span className={styles.autocompleteTitle}>{p.titulo}</span>
                        <span className={styles.autocompleteMeta}>{p.genero} {p.clasificacion ? `· ${p.clasificacion}` : ''}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
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
              <div className="spinner" style={{ width: 32, height: 32 }} />
              <p>Cargando cartelera...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className={styles.empty}><p>No hay películas disponibles</p></div>
          ) : (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>En cartelera</h2>
                <div className={styles.sectionLine} />
                <span className={styles.sectionCount}>{filtradas.length} películas</span>
              </div>
              <div className={styles.cards}>
                {filtradas.map((p, i) => (
                  <div key={p.id} className="fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
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
