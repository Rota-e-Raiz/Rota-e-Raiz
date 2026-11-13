import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'raiz_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

export async function closeDatabase() {
    await pool.end();
}

export function normalizeRestaurant(row) {
    if (!row) return null;
    return {
        id: Number(row.id),
        nome: row.nome,
        cnpj: row.cnpj,
        endereco: row.endereco,
        localidade: row.localidade,
        telefone: row.telefone,
        tipo: row.tipo,
        precoMedio: row.preco_medio == null ? null : Number(row.preco_medio),
        ambientes: Array.isArray(row.ambientes)
            ? row.ambientes
            : typeof row.ambientes === 'string'
                ? JSON.parse(row.ambientes)
                : [],
        historia: row.historia,
        imagem: row.imagem,
        horario: row.horario,
        especialidade: row.especialidade,
        codigoDemo: row.codigo_demo,
        status: row.status
    };
}
