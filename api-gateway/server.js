
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Encaminhar solicitações para os microsserviços
async function encaminhar(req, res, url) {
    try {
        const opcoes = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            opcoes.body = JSON.stringify(req.body);
        }

        const resposta = await fetch(url, opcoes);
        const dados = await resposta.text();

        let resultado;

        try {
            resultado = JSON.parse(dados);
        } catch {
            resultado = { mensagem: dados };
        }

        res.status(resposta.status).json(resultado);

    } catch (error) {
        console.error('Erro ao encaminhar solicitação:', error);

        res.status(502).json({
            erro: 'Não foi possível se comunicar com o microsserviço.',
            detalhe: error.message
        });
    }
}

// Rota inicial
app.get('/', (req, res) => {
    res.json({
        mensagem: 'Bem-vindo à API Pedidos Veloz!',
        status: 'Funcionando',
        servico: 'API Gateway',
        versao: '1.0.0'
    });
});

// Consultar e criar pedidos
app.all('/orders', (req, res) => {
    if (!['GET', 'POST'].includes(req.method)) {
        return res.status(405).json({ erro: 'Método não permitido.' });
    }

    encaminhar(req, res, 'http://orders-service:3001/orders');
});

// Consultar e registrar pagamentos
app.all('/payments', (req, res) => {
    if (!['GET', 'POST'].includes(req.method)) {
        return res.status(405).json({ erro: 'Método não permitido.' });
    }

    encaminhar(req, res, 'http://payments-service:3002/payments');
});

// Consultar estoque
app.all('/inventory', (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ erro: 'Método não permitido.' });
    }

    encaminhar(req, res, 'http://inventory-service:3003/inventory');
});

// Reservar produtos
app.all('/inventory/reserve', (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ erro: 'Método não permitido.' });
    }

    encaminhar(req, res, 'http://inventory-service:3003/inventory/reserve');
});

// Verificação de saúde do Gateway
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        servico: 'api-gateway'
    });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`API Gateway rodando na porta ${PORT}`);
});
