import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, ArrowLeft, ChevronLeft, ChevronRight, Users, Star } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './DetallePelicula.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getProxy = (url) => {
  if (!url?.includes('image.tmdb.org')) return url;
  const path = url.split('/w500/')[1] || url.split('/w342/')[1];
  return path ? `${API}/tmdb/poster/${path}` : url;
};

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const parseLocalDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatHora = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  const ampm = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

export default function DetallePelicula() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [pelicula, setPelicula] = useState(null);
  const [funciones, setFunciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [fechaIdx, setFechaIdx] = useState(0);
  const [diaOffset, setDiaOffset] = useState(0);

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

  const fechasUnicas = useMemo(() => {
    const set = new Set(funciones.map(f => f.fecha.split('T')[0]));
    return [...set].sort();
  }, [funciones]);

  const diasVisibles = fechasUnicas.slice(diaOffset, diaOffset + 4);

  const fechaSeleccionada = fechasUnicas[fechaIdx];

  const funcionesDia = useMemo(() =>
    funciones.filter(f => f.fecha.split('T')[0] === fechaSeleccionada),
    [funciones, fechaSeleccionada]
  );

  const porSala = useMemo(() => {
    const map = {};
    funcionesDia.forEach(f => {
      if (!map[f.sala]) map[f.sala] = [];
      map[f.sala].push(f);
    });
    return map;
  }, [funcionesDia]);

  const handleComprar = (funcion) => {
    if (!usuario) { navigate('/login'); return; }
    navigate(`/comprar/${funcion.id}`);
  };

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (!pelicula) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
      Película no encontrada
    </div>
  );

  const imgSrc = getProxy(pelicula.imagen_url) || `https://placehold.co/400x600/111/555?text=${encodeURIComponent(pelicula.titulo)}`;

  return (
    <main className={styles.main}>
      <div className={styles.backdrop}>
        <img src={imgSrc} alt="" />
        <div className={styles.backdropOverlay} />
      </div>

      <div className={`container ${styles.content}`}>
        <button className={`btn btn-ghost ${styles.back}`} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Volver
        </button>

        {/* Hero info */}
        <div className={styles.hero}>
          <div className={styles.posterWrap}>
            <img src={imgSrc} alt={pelicula.titulo}
              onError={e => e.target.src = `https://placehold.co/400x600/111/555?text=${encodeURIComponent(pelicula.titulo)}`}
              className={styles.posterImg}
            />
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.badges}>
              <span className="badge badge-gray">{pelicula.clasificacion}</span>
              <span className="tag">{pelicula.genero}</span>
            </div>
            <h1 className={styles.titulo}>{pelicula.titulo}</h1>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}><Clock size={13} /> {pelicula.duracion} min</span>
            </div>
            <p className={styles.desc}>{pelicula.descripcion}</p>
          </div>
        </div>

        {/* Selector de fechas + funciones */}
        {fechasUnicas.length > 0 ? (
          <div className={styles.funcionesSection}>
            <h2 className={styles.secTitle}>Selecciona tu función</h2>

            {/* Fecha selector */}
            <div className={styles.fechaNav}>
              <button
                className={styles.navArrow}
                onClick={() => { setDiaOffset(o => Math.max(0, o - 1)); setFechaIdx(Math.max(0, fechaIdx - 1)); }}
                disabled={diaOffset === 0}
              >
                <ChevronLeft size={18} />
              </button>

              <div className={styles.fechas}>
                {diasVisibles.map((fecha) => {
                  const d = parseLocalDate(fecha);
                  const isActive = fecha === fechaSeleccionada;
                  return (
                    <button
                      key={fecha}
                      className={`${styles.fechaBtn} ${isActive ? styles.fechaBtnActive : ''}`}
                      onClick={() => setFechaIdx(fechasUnicas.indexOf(fecha))}
                    >
                      <span className={styles.fechaDia}>{DIAS[d.getDay()]}</span>
                      <span className={styles.fechaNum}>{d.getDate()}</span>
                      <span className={styles.fechaMes}>{MESES[d.getMonth()]}</span>
                    </button>
                  );
                })}
              </div>

              <button
                className={styles.navArrow}
                onClick={() => { setDiaOffset(o => Math.min(fechasUnicas.length - 4, o + 1)); setFechaIdx(Math.min(fechasUnicas.length - 1, fechaIdx + 1)); }}
                disabled={diaOffset >= fechasUnicas.length - 4}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Funciones agrupadas por sala */}
            <div className={styles.salas}>
              {Object.entries(porSala).map(([sala, fns]) => (
                <div key={sala} className={styles.salaGroup}>
                  <div className={styles.salaHeader}>
                    <MapPin size={13} />
                    <span>{sala}</span>
                  </div>
                  <div className={styles.horarios}>
                    {fns.map(f => (
                      <button
                        key={f.id}
                        className={`${styles.horarioBtn} ${f.asientos_disponibles === 0 ? styles.horarioAgotado : ''}`}
                        onClick={() => handleComprar(f)}
                        disabled={f.asientos_disponibles === 0}
                      >
                        <span className={styles.horarioHora}>{formatHora(f.hora)}</span>
                        <span className={styles.horarioInfo}>
                          <span className={styles.horarioPrecio}>${Number(f.precio).toLocaleString('es-CO')}</span>
                          <span className={styles.horarioAsientos}>
                            <Users size={10} /> {f.asientos_disponibles}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.noFunciones}>
            <p>No hay funciones programadas para esta película</p>
          </div>
        )}
      </div>
    </main>
  );
}