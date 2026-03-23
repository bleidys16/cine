import { Router } from 'express';
import { verificarToken, soloAdmin } from '../middleware/auth.js';
import pool from '../db/connection.js';

const router = Router();
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const buscarPosterTMDB = async (titulo) => {
  // Buscar en español primero
  const r1 = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(titulo)}&language=es-ES`);
  const d1 = await r1.json();
  if (d1.results?.[0]?.poster_path) return d1.results[0].poster_path;

  // Luego en inglés
  const r2 = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(titulo)}&language=en-US`);
  const d2 = await r2.json();
  return d2.results?.[0]?.poster_path || null;
};

// GET /api/tmdb/buscar?query=titulo — buscar película
router.get('/buscar', verificarToken, soloAdmin, async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ mensaje: 'Query requerida' });
  try {
    const response = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=es-ES&include_adult=false`);
    const data = await response.json();
    const results = data.results?.slice(0, 6).map(m => ({
      id: m.id,
      titulo: m.title,
      titulo_original: m.original_title,
      año: m.release_date?.slice(0, 4),
      descripcion: m.overview,
      imagen_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    }));
    res.json(results || []);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error buscando en TMDB', error: err.message });
  }
});

// POST /api/tmdb/fix-images — corregir todas las imágenes automáticamente
router.post('/fix-images', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { rows: peliculas } = await pool.query('SELECT id, titulo FROM peliculas ORDER BY id');
    const resultados = [];

    for (const pelicula of peliculas) {
      try {
        const posterPath = await buscarPosterTMDB(pelicula.titulo);
        if (posterPath) {
          const url = `https://image.tmdb.org/t/p/w500${posterPath}`;
          await pool.query('UPDATE peliculas SET imagen_url = $1 WHERE id = $2', [url, pelicula.id]);
          resultados.push({ titulo: pelicula.titulo, estado: 'ok', url });
        } else {
          resultados.push({ titulo: pelicula.titulo, estado: 'no_encontrada' });
        }
        await new Promise(r => setTimeout(r, 250));
      } catch (e) {
        resultados.push({ titulo: pelicula.titulo, estado: 'error', error: e.message });
      }
    }
    res.json({ mensaje: 'Corrección completada', resultados });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error', error: err.message });
  }
});

// GET /api/tmdb/poster/:path — proxy de imagen
router.get('/poster/:path(*)', async (req, res) => {
  try {
    const imgUrl = `https://image.tmdb.org/t/p/w500/${req.params.path}`;
    const response = await fetch(imgUrl);
    if (!response.ok) return res.status(404).send('Not found');
    const buffer = await response.arrayBuffer();
    res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send('Error');
  }
});

export default router;
