// mercadopago.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// URL para receber notificações do Mercado Pago via Webhooks
const urlWebhooksMercadoPago = '/webhooks/mercadopago';

// Função para atualizar o campo de pagamento na planilha
function atualizarPagamento(idPagamento) {
    const fileName = 'NumerosSelecionadosAcumulado6.xlsx';
    if (!fs.existsSync(fileName)) {
        console.error('Arquivo da planilha não encontrado.');
        return;
    }

    const workbook = xlsx.readFile(fileName);
    const worksheet = workbook.Sheets['NumerosSelecionadosAcumulado6'];
    const range = xlsx.utils.decode_range(worksheet['!ref']);

    let rowToUpdate = -1;

    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        const cellAddress = { r: rowNum, c: 3 }; // Coluna D
        const cellRef = xlsx.utils.encode_cell(cellAddress);

        if (worksheet[cellRef] && worksheet[cellRef].v === idPagamento) {
            rowToUpdate = rowNum;
            break;
        }
    }

    if (rowToUpdate === -1) {
        console.log(`IdPagamento ${idPagamento} não encontrado na planilha.`);
        return;
    }

    const cellAddress = { r: rowToUpdate, c: 14 }; // Coluna O
    const cellRef = xlsx.utils.encode_cell(cellAddress);

    worksheet[cellRef] = { t: 's', v: 'Sim' };

    xlsx.writeFile(workbook, fileName);
    console.log(`Pagamento atualizado para o idPagamento ${idPagamento}.`);
}

// Endpoint para receber notificações do Mercado Pago via Webhooks
app.post(urlWebhooksMercadoPago, (req, res) => {
    console.log('Notificação recebida:', req.body);
    if (req.body.type === 'payment' && req.body.action === 'payment.updated') {
        const idPagamento = req.body.data.id;
        atualizarPagamento(idPagamento);
    }
    res.status(200).end();
});

// Endpoint para ser chamado pelo Mercado Pago após a confirmação do pagamento
app.post('/pagamento-confirmado', (req, res) => {
    const { idPagamento } = req.body;
    if (idPagamento) {
        atualizarPagamento(idPagamento);
        res.status(200).send('Pagamento confirmado e atualizado.');
    } else {
        res.status(400).send('ID de pagamento não fornecido.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
