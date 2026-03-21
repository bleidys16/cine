import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Neon agrega channel_binding=require que algunas versiones de pg no soportan
const connectionString = process.env.DATABASE_URL
  ?.replace('&channel_binding=require', '')
  ?.replace('?channel_binding=require&', '?')
  ?.replace('?channel_binding=require', '');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Error en pool de DB:', err.message);
});

export default pool;
