const { Markup } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');
const { waitForLock } = require('./utils');

/**
 * Função para validar números de telefone.
 * @param {string} phoneNumber - Número de telefone a ser validado.
 * @returns {boolean} - Retorna verdadeiro se o número for válido, caso contrário, falso.
 */
function isValidPhoneNumber(phoneNumber) {
    const regex = /^\d{2}\s?\d{9,10}$/;
    return regex.test(phoneNumber);
}

/**
 * Função para gerar um QR Code Pix.
 * @returns {Object|null} - Retorna um objeto com os dados do QR Code ou null em caso de erro.
 */
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

        const accessToken = process.env.ACCESS_TOKEN;

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

/**
 * Função para salvar números selecionados na planilha do Acumulado 6.
 * @param {Array} selectedNumbers - Números selecionados pelo usuário.
 * @param {Object} ctx - Contexto do Telegram.
 * @param {string} qrCode - QR Code gerado.
 */
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

    let release;
    try {
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        let workbook;
        let worksheet;

        if (!fs.existsSync(filePath)) {
            console.log('Arquivo NumerosSelecionadosAcumulado6.xlsx não encontrado. Criando novo workbook...');
            worksheet = xlsx.utils.json_to_sheet(data);
            workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'NumerosSelecionadosAcumulado6');
            xlsx.writeFile(workbook, filePath);
        }

        release = await waitForLock(filePath);

        if (workbook == null) {
            workbook = xlsx.readFile(filePath);
            worksheet = workbook.Sheets['NumerosSelecionadosAcumulado6'];
            xlsx.utils.sheet_add_json(worksheet, data, { origin: -1, skipHeader: true });
        }

        // Obter todos os dados da planilha incluindo o cabeçalho
        const allData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        // Ordenar os dados em ordem alfabética pelo nome, excluindo o cabeçalho
        const header = allData[0];
        const body = allData.slice(1).sort((a, b) => a[0].localeCompare(b[0]));

        // Combinar o cabeçalho com os dados ordenados
        const sortedData = [header, ...body];

        // Atualizar a planilha com os dados ordenados
        const newWorksheet = xlsx.utils.aoa_to_sheet(sortedData);
        workbook.Sheets['NumerosSelecionadosAcumulado6'] = newWorksheet;

        xlsx.writeFile(workbook, filePath);
    } catch (error) {
        console.error('Erro ao salvar números selecionados:', error);
        throw error; // Lançar erro para ser capturado na chamada
    } finally {
        if (release) {
            await release();
        }
    }
}

/**
 * Função para inserir ID de pagamento na planilha.
 * @param {string} idPagamento - ID do pagamento a ser inserido.
 * @param {string} planilhaNome - Nome do arquivo da planilha.
 * @returns {boolean} - Retorna verdadeiro se a inserção for bem-sucedida, caso contrário, falso.
 */
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

/**
 * Função para excluir o teclado numérico.
 * @param {Object} ctx - Contexto do Telegram.
 * @param {number} messageId - ID da mensagem do teclado numérico.
 */
async function deleteNumericKeyboard(ctx, messageId) {
    try {
        if (messageId) {
            await ctx.deleteMessage(messageId);
        }
    } catch (error) {
        console.error('Erro ao excluir o teclado numérico:', error);
    }
}

/**
 * Função para criar um teclado numérico.
 * @param {Object} ctx - Contexto do Telegram.
 * @param {Array} selectedNumbers - Números selecionados pelo usuário.
 * @returns {Array} - Retorna a estrutura do teclado numérico.
 */
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

/**
 * Função para excluir todas as mensagens do contexto do Telegram.
 * @param {Object} ctx - Contexto do Telegram.
 */
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

// Exporta as funções necessárias
module.exports = {
    isValidPhoneNumber,
    gerarQRCodePix,
    salvarNumerosSelecionadosAcumulado6,
    inserirIDPagamentoNaPlanilha,
    deleteNumericKeyboard,
    createNumericKeyboard,
    deleteAllMessages
};
