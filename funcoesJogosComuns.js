const { Markup } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

function isValidPhoneNumber(phoneNumber) {
    const regex = /^\d{2}\s?\d{9,10}$/;
    return regex.test(phoneNumber);
}

async function gerarQRCodePix() {
    try {
        const expire = new Date();
        expire.setMinutes(expire.getMinutes() + 60);
        const paymentData = {
            transaction_amount: 15.00,
            date_of_expiration: expire.toISOString(),
            description: 'Década da Sorte',
            payment_method_id: 'pix',
            payer: {
                email: 'decadadasorte@gmail.com',
                identification: {
                    type: 'CPF',
                    number: '01234567890'
                }
            }
        };

        const accessToken = process.env.ACCESS_TOKEN; // Certifique-se de que o nome da variável de ambiente está correto

        const response = await axios.post('https://api.mercadopago.com/v1/payments', paymentData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response && response.data && response.data.id && response.data.point_of_interaction && response.data.point_of_interaction.transaction_data && response.data.point_of_interaction.transaction_data.qr_code) {
            const idUnico = response.data.id;
            const qrCodeData = response.data.point_of_interaction.transaction_data.qr_code;
            const qrCodeBase64 = response.data.point_of_interaction.transaction_data.qr_code_base64;

            return { id: idUnico, qrCodeData: qrCodeData, qrCodeBase64: qrCodeBase64 };
        } else {
            console.error('Resposta inválida da API do Mercado Pago:', response.data);
            throw new Error('ID do pagamento ou QR Code Pix não encontrado na resposta da API.');
        }
    } catch (error) {
        console.error('Erro ao gerar QR Code para pagamento via Pix:', error);
        return null;
    }
}

async function salvarNumerosSelecionadosAcumulado6(selectedNumbers, ctx, qrCode) {
    const fileName = 'NumerosSelecionadosAcumulado6.xlsx';
    const filePath = path.join(__dirname, fileName);
    let nomeUsuario = '';
    let id = '';
    if (ctx.update.callback_query && ctx.update.callback_query.from) {
        nomeUsuario = `${ctx.update.callback_query.from.first_name || ''} ${ctx.update.callback_query.from.last_name || ''}`;
        id = ctx.update.callback_query.from.id || '';
    }
    const pagamento = 'Não';

    selectedNumbers.sort((a, b) => a - b);

    const now = new Date();
    const dia = now.toLocaleDateString('pt-BR');
    const horario = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const data = [{
        Nome: nomeUsuario,
        ID: id,
        Telefone: ctx.session.userPhoneNumber,
        idPagamento: '',
        Data: dia,
        Horário: horario,
        ...selectedNumbers.reduce((obj, number, index) => {
            obj[`N${index + 1}`] = number;
            return obj;
        }, {}),
        Pagamento: pagamento,
        qr_code: qrCode
    }];

    if (fs.existsSync(filePath)) {
        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets['NumerosSelecionadosAcumulado6'];
        xlsx.utils.sheet_add_json(worksheet, data, { origin: -1, skipHeader: true });
        xlsx.writeFile(workbook, filePath);
    } else {
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'NumerosSelecionadosAcumulado6');
        xlsx.writeFile(workbook, filePath);
    }
}

async function inserirIDPagamentoNaPlanilha(idPagamento, planilhaNome) {
    const filePath = path.join(__dirname, planilhaNome);
    if (!fs.existsSync(filePath)) {
        console.error('Arquivo da planilha não encontrado.');
        return false;
    }

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const range = xlsx.utils.decode_range(worksheet['!ref']);
    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        const cellAddress = { r: rowNum, c: 3 }; // Coluna D
        const cellRef = xlsx.utils.encode_cell(cellAddress);
        if (worksheet[cellRef] && worksheet[cellRef].v === '') {
            worksheet[cellRef].v = idPagamento;
            xlsx.writeFile(workbook, filePath);
            console.log(`ID de pagamento ${idPagamento} inserido na planilha.`);
            return true;
        }
    }

    console.error('Nenhuma célula vazia encontrada para inserir o ID de pagamento.');
    return false;
}

async function deleteNumericKeyboard(ctx, messageId) {
    try {
        if (messageId) {
            await ctx.deleteMessage(messageId);
        }
    } catch (error) {
        console.error('Erro ao excluir o teclado numérico:', error);
    }
}

function createNumericKeyboard(ctx, selectedNumbers) {
    const keyboard = [];
    let row = [];
    for (let i = 1; i <= 60; i++) {
        const buttonText = selectedNumbers.includes(i) ? `${i} ✅` : `${i}`;
        row.push(Markup.button.callback(buttonText, `${i}`));
        if (i % 5 === 0) {
            keyboard.push(row);
            row = [];
        }
    }
    const confirmButton = Markup.button.callback('Confirmar', 'confirmar');
    keyboard.push([confirmButton, Markup.button.callback('Voltar', 'voltar')]);
    return keyboard;
}

async function deleteAllMessages(ctx) {
    if (ctx.session && ctx.session.mensagensIDS) {
        for (let messageId of ctx.session.mensagensIDS) {
            try {
                await ctx.deleteMessage(messageId);
            } catch (error) {
                console.error(`Erro ao deletar mensagem: ${messageId}`, error);
            }
        }
        ctx.session.mensagensIDS = [];
    }
}

module.exports = {
    isValidPhoneNumber,
    gerarQRCodePix,
    salvarNumerosSelecionadosAcumulado6,
    inserirIDPagamentoNaPlanilha,
    deleteNumericKeyboard,
    createNumericKeyboard,
    deleteAllMessages
};
