import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Calendar, MapPin, ChevronRight, ArrowLeft, Users } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './DetallePelicula.module.css';

export default function DetallePelicula() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [pelicula, setPelicula] = useState(null);
  const [funciones, setFunciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/peliculas/${id}`),
      api.get(`/funciones/pelicula/${id}`)
    ]).then(([p, f]) => {
      setPelicula(p.data);
      setFunciones(f.data);
    }).catch(console.error)
      .finally(() => setCargando(false));
  }, [id]);

  const handleSeleccionarFuncion = (funcion) => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    navigate(`/comprar/${funcion.id}`);
  };

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (!pelicula) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Película no encontrada</div>;

  const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(pelicula.titulo)}&background=111620&color=e8b84b&size=800`;

  return (
    <main className={styles.main}>
      {/* Hero backdrop */}
      <div className={styles.backdrop}>
        <img src={pelicula.imagen_url || fallbackImg} alt="" onError={e => e.target.src = fallbackImg} />
        <div className={styles.backdropOverlay} />
      </div>

      <div className={`container ${styles.content}`}>
        <button className={`btn btn-ghost ${styles.back}`} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Volver
        </button>

        <div className={styles.info}>
          <div className={styles.poster}>
            <img src={pelicula.imagen_url || fallbackImg} alt={pelicula.titulo} onError={e => e.target.src = fallbackImg} />
          </div>
          <div className={styles.details}>
            <span className="badge badge-gold">{pelicula.clasificacion}</span>
            <h1 className={styles.titulo}>{pelicula.titulo}</h1>
            <div className={styles.meta}>
              <span className="tag"><Clock size={12} /> {pelicula.duracion} min</span>
              <span className="tag">{pelicula.genero}</span>
            </div>
            <p className={styles.desc}>{pelicula.descripcion}</p>
          </div>
        </div>

        {/* Funciones */}
        <div className={styles.funcionesSection}>
          <h2 className={styles.secTitle}>Funciones disponibles</h2>
          {funciones.length === 0 ? (
            <div className={styles.noFunciones}>
              <Calendar size={36} strokeWidth={1} />
              <p>No hay funciones programadas para esta película</p>
            </div>
          ) : (
            <div className={styles.funciones}>
              {funciones.map(f => (
                <div key={f.id} className={`card ${styles.funcionCard}`}>
                  <div className={styles.funcionInfo}>
                    <div className={styles.funcionFecha}>
                      <Calendar size={14} />
                      <span>{new Date(f.fecha + 'T00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                    <div className={styles.funcionHora}>{f.hora?.slice(0, 5)}</div>
                    <div className={styles.funcionMeta}>
                      <span className="tag"><MapPin size={11} /> {f.sala}</span>
                      <span className="tag"><Users size={11} /> {f.asientos_disponibles} disponibles</span>
                    </div>
                  </div>
                  <div className={styles.funcionRight}>
                    <div className={styles.precio}>
                      <span className={styles.precioLabel}>por asiento</span>
                      <span className={styles.precioVal}>${Number(f.precio).toLocaleString('es-CO')}</span>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSeleccionarFuncion(f)}
                      disabled={f.asientos_disponibles === 0}
                    >
                      {f.asientos_disponibles === 0 ? 'Agotado' : <>Comprar <ChevronRight size={16} /></>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
