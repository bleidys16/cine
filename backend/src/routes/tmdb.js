import { Router } from 'express';
import { verificarToken, soloAdmin } from '../middleware/auth.js';

const router = Router();
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Buscar película en TMDB y devolver poster_path
router.get('/buscar', verificarToken, soloAdmin, async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ mensaje: 'Query requerida' });

  try {
    const response = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=es-ES&include_adult=false`
    );
    const data = await response.json();
    const results = data.results?.slice(0, 5).map(m => ({
      id: m.id,
      titulo: m.title,
      titulo_original: m.original_title,
      año: m.release_date?.slice(0, 4),
      descripcion: m.overview,
      imagen_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      popularidad: m.popularity
    }));
    res.json(results || []);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error buscando en TMDB', error: err.message });
  }
});

// Proxy de imagen TMDB — evita problemas de CORS desde el frontend
router.get('/poster/:path(*)', async (req, res) => {
  try {
    const imgUrl = `https://image.tmdb.org/t/p/w500/${req.params.path}`;
    const response = await fetch(imgUrl);
    if (!response.ok) return res.status(404).send('Not found');
    
    const buffer = await response.arrayBuffer();
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send('Error');
  }
});

export default router;
