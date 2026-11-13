import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool, normalizeRestaurant } from './database.js';
import { clearSessionCookie, createSessionCookie, requireAuth, requireRole } from './auth.js';

const api = Router();

const loginSchema = z.object({
    email: z.string().email().max(190),
    senha: z.string().min(1).max(200),
    tipo: z.enum(['cliente', 'restaurante']).default('cliente')
});
const clientSchema = z.object({
    nome: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(190),
    senha: z.string().min(8).max(200)
});
const restaurantSchema = z.object({
    nome: z.string().trim().min(3).max(160),
    cnpj: z.string().trim().min(11).max(18),
    email: z.string().trim().email().max(190),
    senha: z.string().min(8).max(200),
    endereco: z.string().trim().min(5).max(255),
    localidade: z.enum(['Centro', 'Inocoop', 'Bairro dos 46', 'Bomba', 'Limoeiro', 'Orla de Camaçari']),
    telefone: z.string().trim().min(8).max(30),
    tipo: z.enum(['Restaurante', 'Doceria', 'Bar', 'Cafeteria', 'Lanches rápidos']),
    precoMedio: z.coerce.number().min(1).max(250),
    ambientes: z.array(z.enum(['Aberto', 'Fechado', 'Com música', 'Área kids'])).min(1).max(4),
    historia: z.string().trim().min(10).max(5000),
    imagem: z.string().max(1_500_000)
        .refine(value => value === '' || /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value), 'Envie uma imagem válida.')
        .optional().default('')
});
const highlightSchema = z.object({
    plano: z.enum(['100', '75', '50'])
});
const commentSchema = z.object({
    texto: z.string().trim().min(2).max(2000)
});
const likeSchema = z.object({
    ativo: z.boolean()
});

function parseBody(schema) {
    return (request, response, next) => {
        const parsed = schema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({
                message: 'Confira os dados enviados.',
                errors: parsed.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
            return;
        }
        request.validatedBody = parsed.data;
        next();
    };
}

function publicRestaurant(row) {
    const restaurant = normalizeRestaurant(row);
    if (!restaurant) return null;
    const { cnpj, ...publicData } = restaurant;
    return publicData;
}

function normalizeEmail(email) {
    return email.trim().toLocaleLowerCase('en-US');
}

function handleDuplicateEmail(error, response) {
    if (error.code === 'ER_DUP_ENTRY') {
        response.status(409).json({ message: 'Este e-mail ou CNPJ já está cadastrado.' });
        return true;
    }
    return false;
}

api.get('/health', async (request, response) => {
    await pool.query('SELECT 1');
    response.json({ status: 'ok', database: 'connected' });
});

api.post('/auth/register', parseBody(clientSchema), async (request, response) => {
    const { nome, senha } = request.validatedBody;
    const email = normalizeEmail(request.validatedBody.email);
    const passwordHash = await bcrypt.hash(senha, 12);
    const [result] = await pool.execute(
        'INSERT INTO rr_usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)',
        [nome, email, passwordHash, 'cliente']
    );
    const user = { id: result.insertId, nome, email, tipo: 'cliente' };
    response.setHeader('Set-Cookie', createSessionCookie(user));
    response.status(201).json({ usuario: user });
});

api.post('/auth/register-restaurante', parseBody(restaurantSchema), async (request, response) => {
    const body = request.validatedBody;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const email = normalizeEmail(body.email);
        const [userResult] = await connection.execute(
            'INSERT INTO rr_usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)',
            [body.nome, email, await bcrypt.hash(body.senha, 12), 'restaurante']
        );
        const [restaurantResult] = await connection.execute(
            `INSERT INTO rr_restaurantes
                (usuario_id, nome, cnpj, email, endereco, localidade, telefone, tipo, preco_medio, ambientes, historia, imagem)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userResult.insertId, body.nome, body.cnpj, email, body.endereco, body.localidade,
                body.telefone, body.tipo, body.precoMedio, JSON.stringify(body.ambientes),
                body.historia, body.imagem
            ]
        );
        await connection.commit();
        const user = { id: userResult.insertId, nome: body.nome, email, tipo: 'restaurante' };
        response.setHeader('Set-Cookie', createSessionCookie(user));
        response.status(201).json({
            usuario: user,
            restaurante: { id: restaurantResult.insertId, nome: body.nome }
        });
    } catch (error) {
        await connection.rollback();
        if (handleDuplicateEmail(error, response)) return;
        throw error;
    } finally {
        connection.release();
    }
});

api.post('/auth/login', parseBody(loginSchema), async (request, response) => {
    const { email: submittedEmail, senha, tipo } = request.validatedBody;
    const email = normalizeEmail(submittedEmail);
    const [rows] = await pool.execute(
        'SELECT id, nome, email, senha_hash, tipo FROM rr_usuarios WHERE email = ? LIMIT 1',
        [email]
    );
    const user = rows[0];
    if (!user || user.tipo !== tipo || !(await bcrypt.compare(senha, user.senha_hash))) {
        response.status(401).json({ message: 'E-mail, senha ou tipo de conta incorretos.' });
        return;
    }

    response.setHeader('Set-Cookie', createSessionCookie(user));
    response.json({
        usuario: { id: Number(user.id), nome: user.nome, email: user.email, tipo: user.tipo }
    });
});

api.post('/auth/logout', (request, response) => {
    response.setHeader('Set-Cookie', clearSessionCookie());
    response.status(204).end();
});

api.get('/auth/me', requireAuth, async (request, response) => {
    response.json({ usuario: { ...request.user, id: Number(request.user.id) } });
});

api.get('/restaurantes', async (request, response) => {
    const { localidade, tipo, precoMaximo } = request.query;
    const conditions = ["r.status = 'ativo'"];
    const values = [];
    if (typeof localidade === 'string') {
        conditions.push('r.localidade = ?');
        values.push(localidade);
    }
    if (typeof tipo === 'string') {
        conditions.push('r.tipo = ?');
        values.push(tipo);
    }
    if (precoMaximo !== undefined && Number.isFinite(Number(precoMaximo))) {
        conditions.push('(r.preco_medio IS NULL OR r.preco_medio <= ?)');
        values.push(Number(precoMaximo));
    }
    const [rows] = await pool.execute(
        `SELECT r.* FROM rr_restaurantes r WHERE ${conditions.join(' AND ')} ORDER BY r.criado_em DESC`,
        values
    );
    response.json({ restaurantes: rows.map(publicRestaurant) });
});

api.get('/restaurantes/:id', async (request, response) => {
    const [rows] = await pool.execute(
        "SELECT * FROM rr_restaurantes WHERE id = ? AND status = 'ativo' LIMIT 1",
        [request.params.id]
    );
    if (!rows.length) {
        response.status(404).json({ message: 'Restaurante não encontrado.' });
        return;
    }
    response.json({ restaurante: publicRestaurant(rows[0]) });
});

api.post('/restaurantes', requireAuth, requireRole('restaurante'), parseBody(restaurantSchema.omit({
    nome: true, cnpj: true, email: true, senha: true
})), async (request, response) => {
    const body = request.validatedBody;
    const [owners] = await pool.execute(
        'SELECT id FROM rr_restaurantes WHERE usuario_id = ? LIMIT 1',
        [request.user.id]
    );
    if (!owners.length) {
        response.status(404).json({ message: 'Cadastre primeiro os dados do restaurante.' });
        return;
    }
    await pool.execute(
        `UPDATE rr_restaurantes
         SET endereco = ?, localidade = ?, telefone = ?, tipo = ?, preco_medio = ?,
             ambientes = ?, historia = ?, imagem = ?
         WHERE id = ?`,
        [
            body.endereco, body.localidade, body.telefone, body.tipo, body.precoMedio,
            JSON.stringify(body.ambientes), body.historia, body.imagem, owners[0].id
        ]
    );
    response.json({ message: 'Dados do restaurante atualizados.' });
});

api.put('/me/restaurante/destaque', requireAuth, requireRole('restaurante'), parseBody(z.object({
    nome: z.string().trim().min(3).max(160),
    cnpj: z.string().trim().min(11).max(18),
    imagem: z.string().max(1_500_000)
        .regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/)
})), async (request, response) => {
    const body = request.validatedBody;
    const [result] = await pool.execute(
        'UPDATE rr_restaurantes SET nome = ?, cnpj = ?, imagem = ? WHERE usuario_id = ?',
        [body.nome, body.cnpj, body.imagem, request.user.id]
    );
    if (!result.affectedRows) {
        response.status(404).json({ message: 'Cadastre primeiro os dados do restaurante.' });
        return;
    }
    response.json({ message: 'Dados do restaurante atualizados.' });
});

api.get('/destaques', async (request, response) => {
    const [rows] = await pool.execute(
        `SELECT r.*, d.id AS destaque_id, d.plano, d.posicao, d.valor_mensal, d.fim_em
         FROM rr_destaques d
         INNER JOIN rr_restaurantes r ON r.id = d.restaurante_id
         WHERE d.status = 'ativo' AND r.status = 'ativo'
           AND (d.fim_em IS NULL OR d.fim_em > NOW())
         ORDER BY d.posicao ASC, d.inicio_em DESC`
    );
    response.json({
        destaques: rows.map(row => ({
            ...publicRestaurant(row),
            destaqueId: Number(row.destaque_id),
            plano: row.plano,
            posicao: Number(row.posicao),
            valorMensal: Number(row.valor_mensal),
            fimEm: row.fim_em
        }))
    });
});

api.post('/destaques', requireAuth, requireRole('restaurante'), parseBody(highlightSchema), async (request, response) => {
    const planos = {
        100: { plano: 'mais_visto', posicao: 1 },
        75: { plano: 'popular', posicao: 2 },
        50: { plano: 'basico', posicao: 4 }
    };
    const valor = Number(request.validatedBody.plano);
    const plano = planos[valor];
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [restaurants] = await connection.execute(
            'SELECT id FROM rr_restaurantes WHERE usuario_id = ? AND status = ? LIMIT 1',
            [request.user.id, 'ativo']
        );
        if (!restaurants.length) {
            await connection.rollback();
            response.status(404).json({ message: 'Restaurante ativo não encontrado para esta conta.' });
            return;
        }
        const [highlightResult] = await connection.execute(
            "INSERT INTO rr_destaques (restaurante_id, plano, posicao, valor_mensal, status) VALUES (?, ?, ?, ?, 'pendente')",
            [restaurants[0].id, plano.plano, plano.posicao, valor]
        );
        await connection.execute(
            "INSERT INTO rr_pagamentos (destaque_id, valor, status, provedor) VALUES (?, ?, 'pendente', 'aguardando-integracao')",
            [highlightResult.insertId, valor]
        );
        await connection.commit();
        response.status(202).json({
            destaqueId: highlightResult.insertId,
            status: 'pendente',
            message: 'Solicitação salva. O destaque será ativado após confirmação do pagamento pelo provedor.'
        });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
});

api.get('/restaurantes/:id/comentarios', async (request, response) => {
    const [rows] = await pool.execute(
        `SELECT c.id, c.texto, c.criado_em, u.nome AS autor
         FROM rr_comentarios c INNER JOIN rr_usuarios u ON u.id = c.usuario_id
         WHERE c.restaurante_id = ? ORDER BY c.criado_em DESC LIMIT 100`,
        [request.params.id]
    );
    response.json({ comentarios: rows });
});

api.post('/restaurantes/:id/comentarios', requireAuth, parseBody(commentSchema), async (request, response) => {
    const [restaurants] = await pool.execute(
        "SELECT id FROM rr_restaurantes WHERE id = ? AND status = 'ativo' LIMIT 1",
        [request.params.id]
    );
    if (!restaurants.length) {
        response.status(404).json({ message: 'Restaurante não encontrado.' });
        return;
    }
    const [result] = await pool.execute(
        'INSERT INTO rr_comentarios (restaurante_id, usuario_id, texto) VALUES (?, ?, ?)',
        [request.params.id, request.user.id, request.validatedBody.texto]
    );
    response.status(201).json({
        comentario: {
            id: result.insertId,
            texto: request.validatedBody.texto,
            autor: request.user.nome
        }
    });
});

api.put('/restaurantes/:id/curtidas', requireAuth, parseBody(likeSchema), async (request, response) => {
    const restauranteId = request.params.id;
    const [restaurants] = await pool.execute(
        "SELECT id FROM rr_restaurantes WHERE id = ? AND status = 'ativo' LIMIT 1",
        [restauranteId]
    );
    if (!restaurants.length) {
        response.status(404).json({ message: 'Restaurante não encontrado.' });
        return;
    }
    if (request.validatedBody.ativo) {
        await pool.execute(
            'INSERT IGNORE INTO rr_curtidas (restaurante_id, usuario_id) VALUES (?, ?)',
            [restauranteId, request.user.id]
        );
    } else {
        await pool.execute(
            'DELETE FROM rr_curtidas WHERE restaurante_id = ? AND usuario_id = ?',
            [restauranteId, request.user.id]
        );
    }
    const [[result]] = await pool.execute(
        'SELECT COUNT(*) AS total FROM rr_curtidas WHERE restaurante_id = ?',
        [restauranteId]
    );
    response.json({ curtido: request.validatedBody.ativo, total: Number(result.total) });
});

api.get('/restaurantes/:id/curtidas', async (request, response) => {
    const [[result]] = await pool.execute(
        'SELECT COUNT(*) AS total FROM rr_curtidas WHERE restaurante_id = ?',
        [request.params.id]
    );
    response.json({ total: Number(result.total) });
});

api.get('/meus-restaurantes', requireAuth, requireRole('restaurante'), async (request, response) => {
    const [rows] = await pool.execute(
        'SELECT * FROM rr_restaurantes WHERE usuario_id = ? ORDER BY criado_em DESC',
        [request.user.id]
    );
    response.json({ restaurantes: rows.map(normalizeRestaurant) });
});

api.use((request, response) => {
    response.status(404).json({ message: 'Rota da API não encontrada.' });
});

export default api;
