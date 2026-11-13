import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeDatabase, pool } from './database.js';

const migrationsDirectory = fileURLToPath(new URL('./migrations/', import.meta.url));
const lockName = 'rota_raiz_schema_migrations';

async function loadMigrations() {
    const files = (await readdir(migrationsDirectory))
        .filter(file => /^\d{3,}_[a-z0-9_-]+\.sql$/i.test(file))
        .sort();
    const migrations = await Promise.all(files.map(async file => {
        const sql = await readFile(path.join(migrationsDirectory, file), 'utf8');
        return {
            name: file,
            checksum: createHash('sha256').update(sql).digest('hex'),
            statements: sql.split(';').map(statement => statement.trim()).filter(Boolean)
        };
    }));

    const versions = migrations.map(migration => migration.name.match(/^\d+/)[0]);
    if (new Set(versions).size !== versions.length) {
        throw new Error('Existem arquivos de migração com números de versão repetidos.');
    }
    return migrations;
}

async function ensureMigrationTable(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS rr_migrations (
            version VARCHAR(190) NOT NULL,
            checksum CHAR(64) NOT NULL,
            applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (version)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

export async function migrateUp() {
    const connection = await pool.getConnection();
    let lockAcquired = false;
    try {
        await connection.ping();
        const [[lock]] = await connection.query('SELECT GET_LOCK(?, 30) AS acquired', [lockName]);
        if (lock.acquired !== 1) {
            throw new Error('Não foi possível obter o bloqueio para executar as migrações.');
        }
        lockAcquired = true;
        await ensureMigrationTable(connection);

        const migrations = await loadMigrations();
        const [appliedRows] = await connection.query('SELECT version, checksum FROM rr_migrations');
        const applied = new Map(appliedRows.map(row => [row.version, row.checksum]));

        for (const migration of migrations) {
            const existingChecksum = applied.get(migration.name);
            if (existingChecksum) {
                if (existingChecksum !== migration.checksum) {
                    throw new Error(`A migração aplicada ${migration.name} foi modificada. Crie uma nova migração em vez de editar uma já aplicada.`);
                }
                console.log(`Migração já aplicada: ${migration.name}`);
                continue;
            }

            console.log(`Aplicando migração: ${migration.name}`);
            for (const statement of migration.statements) {
                await connection.query(statement);
            }
            await connection.execute(
                'INSERT INTO rr_migrations (version, checksum) VALUES (?, ?)',
                [migration.name, migration.checksum]
            );
            console.log(`Migração aplicada: ${migration.name}`);
        }
    } finally {
        if (lockAcquired) {
            await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
        }
        connection.release();
    }
}

export async function showMigrationStatus() {
    const connection = await pool.getConnection();
    try {
        await connection.ping();
        await ensureMigrationTable(connection);
        const migrations = await loadMigrations();
        const [rows] = await connection.query('SELECT version, checksum, applied_at FROM rr_migrations');
        const applied = new Map(rows.map(row => [row.version, row]));

        for (const migration of migrations) {
            const record = applied.get(migration.name);
            if (!record) {
                console.log(`Pendente: ${migration.name}`);
            } else if (record.checksum !== migration.checksum) {
                console.log(`DIVERGENTE: ${migration.name}`);
            } else {
                console.log(`Aplicada: ${migration.name} (${record.applied_at})`);
            }
        }
        for (const name of applied.keys()) {
            if (!migrations.some(migration => migration.name === name)) {
                console.log(`Arquivo ausente para migração aplicada: ${name}`);
            }
        }
    } finally {
        connection.release();
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const command = process.argv[2] || 'up';
    try {
        if (command === 'up') {
            await migrateUp();
        } else if (command === 'status') {
            await showMigrationStatus();
        } else {
            throw new Error('Comando inválido. Use: node migrate.js [up|status].');
        }
    } catch (error) {
        console.error('Falha ao executar migrações MySQL:', error.message);
        process.exitCode = 1;
    } finally {
        await closeDatabase();
    }
}
