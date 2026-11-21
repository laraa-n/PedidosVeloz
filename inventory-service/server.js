
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Criar tabela e cadastrar estoque inicial
async function criarTabela() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS inventory (
            id SERIAL PRIMARY KEY,
            produto VARCHAR(255) UNIQUE NOT NULL,
            quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        INSERT INTO inventory (produto, quantidade)
        VALUES
            ('Teclado', 20),
            ('Mouse', 30),
            ('Monitor', 10)
        ON CONFLICT (produto) DO NOTHING
    `);

    console.log('Tabela inventory pronta!');
}

// Rota inicial
app.get('/', (req, res) => {
    res.json({
        mensagem: 'Serviço de Estoque Veloz',
        status: 'Funcionando',
        servico: 'inventory-service'
    });
});

// Consultar estoque
app.get('/inventory', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM inventory ORDER BY id ASC'
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error('Erro ao consultar estoque:', error);
        res.status(500).json({ erro: 'Erro ao consultar estoque.' });
    }
});

// Reservar produtos
app.post('/inventory/reserve', async (req, res) => {
    const { produtoId, quantidade } = req.body;

    if (
        !Number.isInteger(produtoId) ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        return res.status(400).json({
            erro: 'Informe produtoId e quantidade válidos.'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const resultado = await client.query(
            'SELECT * FROM inventory WHERE id = $1 FOR UPDATE',
            [produtoId]
        );

        if (resultado.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                erro: 'Produto não encontrado.'
            });
        }

        const item = resultado.rows[0];

        if (item.quantidade < quantidade) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                erro: 'Estoque insuficiente.'
            });
        }

        const atualizacao = await client.query(
            `UPDATE inventory
             SET quantidade = quantidade - $1
             WHERE id = $2
             RETURNING *`,
            [quantidade, produtoId]
        );

        await client.query('COMMIT');

        res.json({
            mensagem: 'Estoque reservado com sucesso!',
            produto: atualizacao.rows[0].produto,
            quantidadeReservada: quantidade,
            estoqueRestante: atualizacao.rows[0].quantidade
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao reservar estoque:', error);

        res.status(500).json({
            erro: 'Erro ao reservar produto.'
        });
    } finally {
        client.release();
    }
});

// Verificar saúde do serviço e conexão com o banco
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.status(200).json({
            status: 'healthy',
            servico: 'inventory-service',
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            servico: 'inventory-service',
            database: 'disconnected'
        });
    }
});

// Inicializar serviço
async function iniciarServidor() {
    try {
        await pool.query('SELECT 1');
        await criarTabela();

        app.listen(PORT, () => {
            console.log(`Serviço de Estoque rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar serviço de estoque:', error);
        process.exit(1);
    }
}

iniciarServidor();
