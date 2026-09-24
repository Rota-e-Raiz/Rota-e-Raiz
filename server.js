require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3000);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'raiza_db',
    waitForConnections: true,
    connectionLimit: 10
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/estabelecimentos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                id_estabelecimentos,
                nome_estabelecimento,
                cnpj_estabelecimento,
                endereco_estabelecimento,
                telefone_estabelecimento,
                email_estabelecimento,
                horario_estabelecimento,
                tipo_estabelecimento,
                historia_estabelecimento,
                imagem_estabelecimento,
                status_estabelecimento
            FROM estabelecimentos
            ORDER BY id_estabelecimentos DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar estabelecimentos:', error.message);
        res.status(500).json({ error: 'Não foi possível carregar os restaurantes.' });
    }
});

app.post('/api/estabelecimentos', async (req, res) => {
    const {
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        senha,
        horario,
        tipo,
        historia,
        imagem
    } = req.body;

    if (!nome || !cnpj || !endereco || !telefone || !email || !senha || !horario || !tipo || !historia) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const [result] = await pool.execute(`
            INSERT INTO estabelecimentos (
                nome_estabelecimento,
                cnpj_estabelecimento,
                endereco_estabelecimento,
                telefone_estabelecimento,
                email_estabelecimento,
                senha_estabelecimento,
                horario_estabelecimento,
                tipo_estabelecimento,
                historia_estabelecimento,
                imagem_estabelecimento,
                status_estabelecimento
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')
        `, [
            nome.trim(),
            cnpj.trim(),
            endereco.trim(),
            telefone.trim(),
            email.trim().toLowerCase(),
            senhaHash,
            horario.trim(),
            tipo,
            historia.trim(),
            imagem || null
        ]);

        res.status(201).json({
            id: result.insertId,
            message: 'Restaurante cadastrado com sucesso.'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'CNPJ ou e-mail já cadastrado.' });
        }

        console.error('Erro ao cadastrar estabelecimento:', error.message);
        res.status(500).json({ error: 'Não foi possível cadastrar o restaurante.' });
    }
});

app.listen(port, () => {
    console.log(`API Rota & Raiz disponível em http://localhost:${port}`);
});
