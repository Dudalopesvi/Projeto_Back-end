import pool from '../config/db.js';

export const checkStatus = async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'ok',
      servidor: 'rodando',
      banco: 'conectado',
      horaBanco: result.rows[0].now,
    });
  } catch (err) {
    console.error('Erro ao conectar ao banco:', err);
    res.status(500).json({
      status: 'erro',
      servidor: 'rodando',
      banco: 'desconectado',
      detalhe: err.message,
    });
  }
};