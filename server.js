const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    password: 'senai',
    host: "localhost",
    port: 5433,
    database: "saepVision"
});

app.get("/api/anuncios", async (req, res) => {
    try {
        const { modelo } = req.query;
        const params = [];

        // CORREÇÃO: Ajustado os pontos das tabelas (i.anuncio_id e a.id)
        // CORREÇÃO: Adicionado um espaço em branco no final da string para não grudar no WHERE
        let query = `
      SELECT a.id, a.titulo, a.localidade, a.preco, a.img, a.vendedor_id, a.criado_em,
             u.nome AS vendedor,
             u.usuario AS vendedor_usuario,
             u.telefone AS vendedor_telefone,
             COUNT(i.id)::int AS interesses 
      FROM anuncios a
      JOIN usuarios u ON u.id = a.vendedor_id
      LEFT JOIN interesses i ON i.anuncio_id = a.id 
    `;

        // CORREÇÃO: O espaço antes de WHERE evita que a query quebre por falta de espaçamento
        if (modelo) {
            params.push(`%${modelo}%`);
            query += ` WHERE a.titulo ILIKE $${params.length}`;
        }

        query += ` GROUP BY a.id, u.nome, u.usuario, u.telefone `;

        const { rows } = await pool.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error("Erro ao buscar anúncios:", error);
        res.status(500).json({ error: "Erro interno no servidor ao processar a consulta." });
    }
});



//ROTA DE LOGIN
app.post('/api/login', async (req, res) => {
    const { usuario, senha } = req.body;
    const { rows } = await pool.query(
        `SELECT id, nome,usuario,telefone,foto_perfil 
        FROM usuarios
        WHERE usuario = $1 AND senha = $2`,
        [usuario, senha]
    )
    if (rows.length === 0) {
        return res.status(401).json({ erro: "usuário ou senha incorreta" })
    }
    res.json(rows[0])
});

//ROTA INTERESSES
app.post("/api/interesses/:anuncioID", async (req, res) => {
    const { anuncioID } = req.params;
    const { cliente_nome, cliente_contato } = req.body;

    if (!cliente_nome || !cliente_contato) {
        return res.status(400).json({ erro: 'Nome e contato inválidos' });
    }
    await pool.query(
        `INSERT INTO interesses (anuncio_ID,cliente_nome,cliente_contato)
    VALUES($1,$2,$3)`,
        [anuncioID, cliente_nome, cliente_contato],



    );
    const { rows } = await pool.query(
        `SELECT COUNT(*):: int AS total FROM interesses WHERE anuncio_ID = $1 `,
        [anuncioID],
    );

    res.json({ interesses: rows[0].total });

});


//PERFIL
app.get('/api/perfil/:id', async (req, res) => {
    const { id } = req.params;
    const anuncios = await pool.query(
        `SELECT a.id,a.titulo,a.preco,a.img,a.criado_em ,

     COUNT(i.id):: int AS interesses
     FROM anuncios a  LEFT JOIN interesses i
      ON i.anuncio_id = a.id
     WHERE a.vendedor_id = $1 GROUP BY a.id ORDER BY a.criado_em DESC   `,
        [id]
    )

    const totalinteresses = anuncios.rows.reduce(
         (acc, a) => {
            return acc + a.interesses 


        },
    0);
 res.json({
    totAnuncios: anuncios.rows.length,
    totalinteresses,
    anuncios: anuncios.rows,
 })



});

//ENVIAR MENSGEM
app.post('/api/mensagens/:anuncioID', async (req,res) => {
    const {anuncioID} = req.params;
    const {cliente_nome,cliente_contato,mensagens} = req.body

    if (!cliente_contato|| !cliente_nome || !mensagens) {
        return res.status(400).json({erro: "Nome, contato e mensagem são obrigatórios"});
    }
    await pool.query(
       ` INSERT INTO mensagens (anuncio_id, cliente_nome, cliente_contato, mensagem)
VALUES ($1, $2, $3, $4)`,
        [anuncioID,cliente_nome,cliente_contato,mensagens],
    );
    res.json({ok:true});
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
