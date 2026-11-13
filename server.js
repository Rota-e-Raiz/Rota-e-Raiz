import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import api from './api.js';
import { closeDatabase } from './database.js';
import { migrateUp } from './migrate.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const projectDirectory = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));
app.use((request, response, next) => {
    if (
        request.path.toLocaleLowerCase().startsWith('/node_modules/')
        || request.path.toLocaleLowerCase().startsWith('/migrations/')
        || /^\/(?:package(?:-lock)?\.json|database\.js|api\.js|auth\.js|migrate\.js|server\.js)$/.test(request.path)
    ) {
        response.sendStatus(404);
        return;
    }
    next();
});
app.use('/api', api);
app.use(express.static(projectDirectory, { dotfiles: 'deny' }));

app.use((error, request, response, next) => {
    console.error('Erro ao processar a solicitação:', error);
    if (response.headersSent) {
        next(error);
        return;
    }
    if (error.code === 'ER_DUP_ENTRY') {
        response.status(409).json({ message: 'Este e-mail ou CNPJ já está cadastrado.' });
        return;
    }
    if (error instanceof SyntaxError && 'body' in error) {
        response.status(400).json({ message: 'O corpo da solicitação contém JSON inválido.' });
        return;
    }
    response.status(500).json({ message: 'Ocorreu um erro interno. Tente novamente.' });
});

try {
    if (!process.env.DB_PASSWORD) {
        throw new Error('DB_PASSWORD não foi configurada no arquivo .env.');
    }
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
        throw new Error('SESSION_SECRET deve ter pelo menos 32 caracteres no arquivo .env.');
    }
    await migrateUp();
    app.listen(port, () => console.log(`Servidor Rota & Raiz disponível em http://localhost:${port}`));
} catch (error) {
    console.error('Não foi possível iniciar o servidor conectado ao MySQL:', error.message);
    await closeDatabase();
    process.exitCode = 1;
}