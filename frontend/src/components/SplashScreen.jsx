import { useEffect, useState } from 'react';
import styles from './SplashScreen.module.css';

export default function SplashScreen({ onDone }) {
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSaliendo(true), 2000);
    const t2 = setTimeout(() => onDone?.(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`${styles.splash} ${saliendo ? styles.fadeOut : ''}`}>
      <div className={styles.filmStrip}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={styles.filmFrame} style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
      <div className={`${styles.filmStrip} ${styles.filmStripRight}`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={styles.filmFrame} style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>

      <div className={`${styles.logoWrap} ${styles.logoVisible}`}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="8" width="36" height="24" rx="3" fill="#d4a843"/>
            <rect x="2" y="8" width="6" height="24" fill="#0a0a0a" opacity="0.3"/>
            <rect x="32" y="8" width="6" height="24" fill="#0a0a0a" opacity="0.3"/>
            <rect x="5" y="11" width="4" height="4" rx="0.5" fill="#0a0a0a"/>
            <rect x="5" y="18" width="4" height="4" rx="0.5" fill="#0a0a0a"/>
            <rect x="5" y="25" width="4" height="4" rx="0.5" fill="#0a0a0a"/>
            <rect x="31" y="11" width="4" height="4" rx="0.5" fill="#0a0a0a"/>
            <rect x="31" y="18" width="4" height="4" rx="0.5" fill="#0a0a0a"/>
            <rect x="31" y="25" width="4" height="4" rx="0.5" fill="#0a0a0a"/>
          </svg>
        </div>
        <div className={styles.logoText}>
          CINE<span>APP</span>
        </div>
        <div className={styles.loadingBar}>
          <div className={styles.loadingFill} />
        </div>
        <p className={styles.loadingLabel}>Cargando experiencia</p>
      </div>
    </div>
  );
}