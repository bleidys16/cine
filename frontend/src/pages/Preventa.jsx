import { useEffect, useState } from 'react';
import { Film, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PeliculaCard from '../components/PeliculaCard';
import styles from './Home.module.css';

export default function Preventa() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/peliculas')
      .then(r => setPeliculas(r.data.filter(p => p.estado === 'preventa')))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className={styles.main}>
      <section className={styles.grid}>
        <div className="container">
          {cargando ? (
            <div className={styles.loading}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
              <p>Cargando preventa...</p>
            </div>
          ) : peliculas.length === 0 ? (
            <div className={styles.empty}>
              <Film size={56} strokeWidth={1} />
              <h3>No hay preventa disponible</h3>
              <p>Pronto anunciaremos nuevos estrenos</p>
              <Link to="/" className="btn btn-outline" style={{ marginTop: 8 }}>
                Ver cartelera actual
              </Link>
            </div>
          ) : (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}><Ticket size={18} /> Preventa</h2>
                <div className={styles.sectionLine} />
                <span className={styles.sectionCount}>{peliculas.length} películas</span>
              </div>
              <div className={styles.cards}>
                {peliculas.map((p, i) => (
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