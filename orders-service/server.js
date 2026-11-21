
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Criar tabela de pedidos no PostgreSQL
async function criarTabela() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            produto VARCHAR(255) NOT NULL,
            quantidade INTEGER NOT NULL CHECK (quantidade > 0),
            status VARCHAR(50) NOT NULL DEFAULT 'Criado',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('Tabela orders pronta!');
}

// Rota inicial
app.get('/', (req, res) => {
    res.json({
        mensagem: 'Serviço de Pedidos Veloz',
        status: 'Funcionando',
        servico: 'orders-service'
    });
});

// Consultar todos os pedidos
app.get('/orders', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM orders ORDER BY id ASC'
        );

        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao consultar pedidos:', erro);

        res.status(500).json({
            erro: 'Erro ao consultar pedidos.'
        });
    }
});

// Criar um pedido
app.post('/orders', async (req, res) => {
    try {
        const { produto, quantidade } = req.body;

        if (
            !produto ||
            typeof produto !== 'string' ||
            !produto.trim() ||
            !Number.isInteger(quantidade) ||
            quantidade <= 0
        ) {
            return res.status(400).json({
                erro: 'Informe um produto e uma quantidade válida.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO orders (produto, quantidade, status)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [produto.trim(), quantidade, 'Criado']
        );

        res.status(201).json({
            mensagem: 'Pedido criado com sucesso!',
            pedido: resultado.rows[0]
        });

    } catch (erro) {
        console.error('Erro ao criar pedido:', erro);

        res.status(500).json({
            erro: 'Erro ao criar pedido.'
        });
    }
});

// Verificar saúde do serviço
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.status(200).json({
            status: 'healthy',
            servico: 'orders-service',
            database: 'connected'
        });
    } catch (erro) {
        res.status(503).json({
            status: 'unhealthy',
            servico: 'orders-service',
            database: 'disconnected'
        });
    }
});

// Inicializar aplicação após conectar ao banco
async function iniciarServidor() {
    try {
        await pool.query('SELECT 1');
        await criarTabela();

        app.listen(PORT, () => {
            console.log(
                `Serviço de Pedidos rodando na porta ${PORT}`
            );
        });
    } catch (erro) {
        console.error('Erro ao conectar ao PostgreSQL:', erro);
        process.exit(1);
    }
}

iniciarServidor();
