// Script para actualizar imágenes de todas las películas usando TMDB API
// Ejecutar: node src/scripts/fixImages.js

import pool from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const buscarPoster = async (titulo) => {
  try {
    const res = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(titulo)}&language=es-ES&include_adult=false`
    );
    const data = await res.json();
    const movie = data.results?.[0];
    if (movie?.poster_path) {
      return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    }
    // Intentar en inglés si no encontró en español
    const res2 = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(titulo)}&language=en-US&include_adult=false`
    );
    const data2 = await res2.json();
    const movie2 = data2.results?.[0];
    return movie2?.poster_path ? `https://image.tmdb.org/t/p/w500${movie2.poster_path}` : null;
  } catch (err) {
    console.error(`Error buscando ${titulo}:`, err.message);
    return null;
  }
};

const fixImages = async () => {
  console.log('🎬 Iniciando corrección de imágenes...\n');
  
  const { rows: peliculas } = await pool.query('SELECT id, titulo FROM peliculas ORDER BY id');
  
  for (const pelicula of peliculas) {
    const poster = await buscarPoster(pelicula.titulo);
    if (poster) {
      await pool.query('UPDATE peliculas SET imagen_url = $1 WHERE id = $2', [poster, pelicula.id]);
      console.log(`✅ ${pelicula.titulo} → ${poster.split('/').pop()}`);
    } else {
      console.log(`❌ ${pelicula.titulo} → No encontrada`);
    }
    // Pequeña pausa para no saturar la API
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('\n✅ Corrección completada');
  pool.end();
};

fixImages().catch(err => {
  console.error('Error:', err);
  pool.end();
});
