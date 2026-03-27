import pool from './src/db/connection.js';

async function check() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tiquetes'");
    console.log('Columnas de tiquetes:', res.rows);
    
    // De paso intentamos ver que pasa si tratamos de comprar
    // NO, solo veamos las columnas
  } catch(e) { 
    console.error(e); 
  }
  process.exit();
}
check();
