
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Criar tabela de pagamentos
async function criarTabela() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            pedido_id INTEGER NOT NULL,
            valor NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
            metodo VARCHAR(50) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'Aprovado',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('Tabela payments pronta!');
}

// Rota inicial
app.get('/', (req, res) => {
    res.json({
        mensagem: 'Serviço de Pagamentos Veloz',
        status: 'Funcionando',
        servico: 'payments-service'
    });
});

// Consultar todos os pagamentos
app.get('/payments', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM payments ORDER BY id ASC'
        );

        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao consultar pagamentos:', erro);

        res.status(500).json({
            erro: 'Erro ao consultar pagamentos.'
        });
    }
});

// Processar pagamento
app.post('/payments', async (req, res) => {
    try {
        const { pedidoId, valor, metodo } = req.body;

        if (
            !Number.isInteger(pedidoId) ||
            pedidoId <= 0 ||
            typeof valor !== 'number' ||
            !Number.isFinite(valor) ||
            valor <= 0 ||
            typeof metodo !== 'string' ||
            !metodo.trim()
        ) {
            return res.status(400).json({
                erro: 'Informe pedidoId, valor e metodo válidos.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO payments
            (pedido_id, valor, metodo, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [pedidoId, valor, metodo.trim(), 'Aprovado']
        );

        const pagamentoSalvo = resultado.rows[0];

        const pagamento = {
            id: pagamentoSalvo.id,
            pedidoId: pagamentoSalvo.pedido_id,
            valor: Number(pagamentoSalvo.valor),
            metodo: pagamentoSalvo.metodo,
            status: pagamentoSalvo.status
        };

        res.status(201).json({
            mensagem: 'Pagamento processado com sucesso!',
            pagamento
        });

    } catch (erro) {
        console.error('Erro ao processar pagamento:', erro);

        res.status(500).json({
            erro: 'Erro ao processar pagamento.'
        });
    }
});

// Verificar saúde do serviço e banco
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.status(200).json({
            status: 'healthy',
            servico: 'payments-service',
            database: 'connected'
        });
    } catch (erro) {
        res.status(503).json({
            status: 'unhealthy',
            servico: 'payments-service',
            database: 'disconnected'
        });
    }
});

// Inicializar servidor
async function iniciarServidor() {
    try {
        await pool.query('SELECT 1');
        await criarTabela();

        app.listen(PORT, () => {
            console.log(
                `Serviço de Pagamentos rodando na porta ${PORT}`
            );
        });
    } catch (erro) {
        console.error('Erro ao conectar ao PostgreSQL:', erro);
        process.exit(1);
    }
}

iniciarServidor();
