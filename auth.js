import jwt from 'jsonwebtoken';
import { pool } from './database.js';

const cookieName = 'rota_raiz_session';
const sessionDurationSeconds = 60 * 60 * 24 * 7;

function cookieOptions(maxAge) {
    const options = [
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${maxAge}`
    ];
    if (process.env.NODE_ENV === 'production') options.push('Secure');
    return options.join('; ');
}

function readCookie(request, name) {
    const cookieHeader = request.headers.cookie || '';
    const cookie = cookieHeader.split(';').map(value => value.trim())
        .find(value => value.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : '';
}

export function createSessionCookie(user) {
    const token = jwt.sign(
        { role: user.tipo },
        process.env.SESSION_SECRET,
        { subject: String(user.id), expiresIn: sessionDurationSeconds }
    );
    return `${cookieName}=${encodeURIComponent(token)}; ${cookieOptions(sessionDurationSeconds)}`;
}

export function clearSessionCookie() {
    return `${cookieName}=; ${cookieOptions(0)}`;
}

export async function requireAuth(request, response, next) {
    const token = readCookie(request, cookieName);
    if (!token) {
        response.status(401).json({ message: 'Faça login para continuar.' });
        return;
    }

    try {
        const payload = jwt.verify(token, process.env.SESSION_SECRET);
        const userId = Number(payload.sub);
        if (!Number.isSafeInteger(userId)) {
            response.status(401).json({ message: 'Sessão inválida.' });
            return;
        }

        const [rows] = await pool.execute(
            'SELECT id, nome, email, tipo FROM rr_usuarios WHERE id = ?',
            [userId]
        );
        if (!rows.length) {
            response.status(401).json({ message: 'Sessão inválida.' });
            return;
        }

        request.user = rows[0];
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            response.status(401).json({ message: 'Sua sessão expirou. Entre novamente.' });
            return;
        }
        next(error);
    }
}

export function requireRole(role) {
    return (request, response, next) => {
        if (request.user?.tipo !== role) {
            response.status(403).json({ message: 'Esta ação não está disponível para seu tipo de conta.' });
            return;
        }
        next();
    };
}
