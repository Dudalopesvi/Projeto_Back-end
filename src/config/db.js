import { Pool } from 'pg';

console.log('DB_PASSWORD carregada:', JSON.stringify(process.env.DB_PASSWORD));
console.log('DB_USER carregada:', JSON.stringify(process.env.DB_USER));
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
  process.exit(-1);
});

export default pool;