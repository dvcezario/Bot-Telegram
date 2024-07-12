// mercadopago.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');
const { enviarMensagemConfirmacaoPagamento } = require('./mensagensAssincronas');
const { waitForLock } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());

// URL para receber notificações do Mercado Pago via Webhooks
const urlWebhooksMercadoPago = '/webhooks/mercadopago';

// Função para atualizar o campo de pagamento na planilha
async function atualizarPagamento(idPagamento) {
    const fileName = path.join(__dirname, 'NumerosSelecionadosAcumulado6.xlsx');
    if (!fs.existsSync(fileName)) {
        console.error('Arquivo da planilha não encontrado.');
        return;
    }

    let release;
    try {
        release = await waitForLock(fileName);

        const workbook = xlsx.readFile(fileName);
        const worksheet = workbook.Sheets['NumerosSelecionadosAcumulado6'];
        const range = xlsx.utils.decode_range(worksheet['!ref']);

        let rowToUpdate = -1;
        let nomeUsuario = '';
        let telegramId = '';

        for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            const cellAddress = { r: rowNum, c: 3 }; // Coluna D
            const cellRef = xlsx.utils.encode_cell(cellAddress);

            if (worksheet[cellRef] && worksheet[cellRef].v === idPagamento) {
                rowToUpdate = rowNum;
                nomeUsuario = worksheet[xlsx.utils.encode_cell({ r: rowNum, c: 0 })].v; // Nome do usuário
                telegramId = worksheet[xlsx.utils.encode_cell({ r: rowNum, c: 1 })].v; // ID do Telegram
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

        // Enviar mensagem de confirmação de pagamento
        await enviarMensagemConfirmacaoPagamento(nomeUsuario, telegramId);
    } catch (error) {
        console.error('Erro ao atualizar a planilha:', error);
    } finally {
        if (release) {
            await release();
        }
    }
}

// Endpoint para receber notificações do Mercado Pago via Webhooks
app.post(urlWebhooksMercadoPago, (req, res) => {
    console.log('Notificação recebida:', req.body);
    if (req.body.type === 'payment' && req.body.action === 'payment.updated') {
        const idPagamento = req.body.data.id;
        atualizarPagamento(idPagamento).catch(console.error);
    }
    res.status(200).end();
});

// Endpoint para ser chamado pelo Mercado Pago após a confirmação do pagamento
app.post('/pagamento-confirmado', (req, res) => {
    const { idPagamento } = req.body;
    if (idPagamento) {
        atualizarPagamento(idPagamento).catch(console.error);
        res.status(200).send('Pagamento confirmado e atualizado.');
    } else {
        res.status(400).send('ID de pagamento não fornecido.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
