import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.js';
import peliculasRoutes from './routes/peliculas.js';
import funcionesRoutes from './routes/funciones.js';
import tiquetesRoutes from './routes/tiquetes.js';
import tmdbRoutes from './routes/tmdb.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://cine-psi-lilac.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/funciones', funcionesRoutes);
app.use('/api/tiquetes', tiquetesRoutes);
app.use('/api/tmdb', tmdbRoutes);

app.get('/api/health', (_, res) => res.json({ estado: 'OK', timestamp: new Date() }));

app.listen(PORT, () => {
  console.log(`🎬 Servidor CineApp corriendo en puerto ${PORT}`);
});
// force deploy Mon Mar 23 01:20:31 UTC 2026
