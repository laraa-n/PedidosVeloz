
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pedidos_veloz',
    user: process.env.DB_USER || 'pedidos_user',
    password: process.env.DB_PASSWORD
});

pool.on('error', (err) => {
    console.error('Erro inesperado no PostgreSQL:', err);
});

module.exports = pool;
