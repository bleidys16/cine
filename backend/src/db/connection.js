import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../../.env') });

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
