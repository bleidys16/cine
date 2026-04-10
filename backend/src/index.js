import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import authRoutes from './routes/auth.js';
import peliculasRoutes from './routes/peliculas.js';
import funcionesRoutes from './routes/funciones.js';
import tiquetesRoutes from './routes/tiquetes.js';
import tmdbRoutes from './routes/tmdb.js';
import salasRoutes from './routes/salas.js';
import { enviarBienvenida } from './services/emailService.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://cine-psi-lilac.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: true, // Permitir cualquier origen temporalmente para depurar CORS o usar el validador anterior
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/funciones', funcionesRoutes);
app.use('/api/tiquetes', tiquetesRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/salas', salasRoutes);

app.get('/api/health', (_, res) => res.json({ estado: 'OK', timestamp: new Date() }));

app.get('/api/test-email', async (req, res) => {
  const result = await enviarBienvenida({ nombre: 'Admin', email: 'camilojc1725@gmail.com' });
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🎬 Servidor CineApp corriendo en puerto ${PORT}`);
});
// force deploy Sun Apr 10 10:48:00 UTC 2026
