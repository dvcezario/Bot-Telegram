const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
const PORT = 3000;
const ngrokURL = 'https://a473-2804-389-b189-4591-c13-e623-405c-220.ngrok-free.app';

app.use(bodyParser.json());

// Chave secreta para verificar a assinatura
const signatureSecret = process.env.signatureSecret;

// URL para receber notificações do Mercado Pago via Webhooks
const urlWebhooksMercadoPago = '${ngrokURL}/webhooks/mercadopago';

// URL para ser chamada pelo Mercado Pago após a confirmação do pagamento
const urlPagamentoConfirmado = '${ngrokURL}/pagamento-confirmado';

// Middleware para verificar a assinatura da solicitação do Mercado Pago
function verificarAssinatura(req, res, next) {
    const signature = req.get('x-signature');
    if (!req.body) {
        return res.status(400).send('Corpo da solicitação ausente.');
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', signatureSecret)
                                    .update(body)
                                    .digest('hex');

    if (signature === expectedSignature) {
        next();
    } else {
        console.error('Assinatura inválida. Solicitação rejeitada.');
        res.status(401).send('Assinatura inválida.');
    }
}

// Função para atualizar o campo de pagamento na planilha
function atualizarPagamento(idPagamento) {
    const fileName = 'NumerosSelecionados.xlsx';
    if (fs.existsSync(fileName)) {
        const workbook = xlsx.readFile(fileName);
        const worksheet = workbook.Sheets['NumerosSelecionados'];
        const range = worksheet['!ref'].split(':').map(xlsx.utils.decode_cell);

        let rowToUpdate = -1;

        for (let rowNum = range[0].r; rowNum <= range[1].r; rowNum++) {
            const cellAddress = { r: rowNum, c: 3 }; // Coluna D
            const cellRef = xlsx.utils.encode_cell(cellAddress);

            if (worksheet[cellRef] && worksheet[cellRef].v === idPagamento) {
                rowToUpdate = rowNum;
                break;
            }
        }

        if (rowToUpdate !== -1) {
            const cellAddress = { r: rowToUpdate, c: 14 }; // Coluna O
            const cellRef = xlsx.utils.encode_cell(cellAddress);

            worksheet[cellRef] = { t: 's', v: 'Sim' };

            xlsx.writeFile(workbook, fileName);
            console.log(`Pagamento atualizado para o idPagamento ${idPagamento}.`);
        } else {
            console.log(`IdPagamento ${idPagamento} não encontrado na planilha.`);
        }
    } else {
        console.log('Arquivo da planilha não encontrado.');
    }
}

// Endpoint para receber notificações do Mercado Pago via Webhooks
app.post(urlWebhooksMercadoPago, verificarAssinatura, (req, res) => {
    console.log('Notificação recebida:', req.body);
    if (req.body.type === 'payment' && req.body.action === 'payment.created') {
        const idPagamento = req.body.data.id;
        atualizarPagamento(idPagamento);
    }
    res.status(200).end();
});

// Endpoint para ser chamado pelo Mercado Pago após a confirmação do pagamento
app.post(urlPagamentoConfirmado, (req, res) => {
    const idPagamento = req.body.idPagamento;
    atualizarPagamento(idPagamento);
    res.status(200).end();
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
