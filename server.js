const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public')); // serve index.html, style.css, app.js, assets, uploads

const pool = new Pool({
  user: 'postgres',
  password: 'senai',
  host: 'localhost',
  port: 5432,
  database: 'streamFlix'
});

app.get('/api/filme', async (req, res) => {
  const { modelo } = req.query;
  const params = [];
  

  let query = `
    SELECT a.id_filme, a.titulo_filme, a.genero, a.url_capa, 
           u.nome AS adm,
           COUNT(i.id_filme)::titulo_filme AS filme_opcao
    FROM filme a
    JOIN usuarios u ON u.titulo_filme = a.nome_filme
    LEFT JOIN interesses i ON i.id_filme = a.id_opcao_filme
  `;

  if (modelo) {
    params.push(`%${modelo}%`);
    query += ` WHERE a.titulo_filme ILIKE $${params.length}`;
  }

  query +=
    ' GROUP BY a.id_usuario, u.nome_usuario, u.senha, u.email ORDER BY a.criado_em DESC';

  const { rows } = await pool.query(query, params);
  res.json(rows);


if (modelo) {
  params.push(`%${modelo}%`);
  query += ` WHERE a.titulo ILIKE $${params.length}`;
}
  


query +=
  ' GROUP BY a.id, u.nome, u.usuario, u.telefone ORDER BY a.criado_em DESC';

const { rows } = await pool.query(query, params);
res.json(rows);
});

app.post('/api/login', async (req, res) => {
  const { usuario, senha } = req.body;
  const { rows } = await pool.query(
    'SELECT id, nome, usuario, telefone, foto_perfil FROM usuarios WHERE usuario = $1 AND senha = $2',
    [usuario, senha],
  );
  if (rows.length === 0) {
    return res
      .status(401)
      .json({ erro: 'Usuário não encontrado ou senha incorreta' });
  }
  res.json(rows[0]);
});

app.post('/api/interesses/:id_filme', async (req, res) => {
  const { id_filme } = req.params;
  const { usuario_nome } = req.body;

  if (!cliente_nome) {
    return res.status(400).json({ erro: 'Nome é obrigatórios' });
  }

  await pool.query(
    'INSERT INTO tb_curtida (id_usuario, nome, nome_usuario, email) VALUES ($1, $2, $3,$4)',
    [id_usuario, usuario_nome, cliente_email],
  );

  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM tb_curtida WHERE id_filme = $1',
    [id_filme],
  );
  res.json({ interesses: rows[0].total });
});

app.get('/api/perfil/:id', async (req, res) => {
  const { id } = req.params;
  const anuncios = await pool.query(
    `
    SELECT a.id_filme, a.titulo_filme, a.genero, a.url_capa, COUNT(i.id_filme)::int AS tb_curtida
    FROM tb_curtida a LEFT JOIN tb_curtida i ON i.id_filme = a.id
    WHERE a.administrador = $1 GROUP BY a.id ORDER BY a.updated_tb DESC
  `,
    [id_filme],
  );

  const totalInteresses = anuncios.rows.reduce(
    (acc, a) => acc + a.tb_curtida,
    0,
  );

  res.json({
    totalFilmes: id_filme.rows.length,
    totalFilmes,
    Filmes: id_filmes.rows,
  });
});

app.post('/api/filmes', upload.single('url_capa'), async (req, res) => {
  const { titulo_filme, genero, admistrador } = req.body;
  if (!req.file) return res.status(400).json({ erro: 'Imagem obrigatória' });

  const { rows } = await pool.query(
    'INSERT INTO anuncios (titulo_filme, ,genero,url_capa, ) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [titulo, local, preco, req.file.filename, vendedor_id],
  );
  res.json(rows[0]);
});

app.delete('/api/anuncios/:id', async (req, res) => {
  await pool.query('DELETE FROM anuncios WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/mensagens/:anuncioId', async (req, res) => {
  const { anuncioId } = req.params;
  const { cliente_nome, cliente_contato, mensagem } = req.body;

  if (!cliente_nome) {
    return res
      .status(400)
      .json({ erro: 'Nome é obrigatório' });
  }


});

app.listen(3000, () =>
  console.log('Servidor rodando em http://localhost:3000'),
);


