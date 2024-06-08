require('dotenv').config();

const fs = require('fs');
const xlsx = require('xlsx');
const { Markup } = require('telegraf');
const axios = require('axios');
const crypto = require('crypto');
const session = require('telegraf/session');
const lockfile = require('proper-lockfile');
const path = require('path');
const { mensagensIDS, deleteAllMessages } = require('./telaInicial');
const bot = require('./bot');
let selectedNumbers = [];
let userPhoneNumber = ''; // Variável global para armazenar o número de telefone
let idUnicoGlobal;
let qrCodeDataGlobal;
// Variável para armazenar o message_id da mensagem "Escolha 10 números"
let mensagemEscolhaNumerosId;

// Função para validar o número de telefone
function isValidPhoneNumber(phoneNumber) {
    // Expressão regular para o padrão xx yyyyyyyyy ou xxyyyyyyyyy
    const regex = /^\d{2}\s?\d{9,10}$/;
    return regex.test(phoneNumber);
}

// Função para validar os números selecionados
function validateSelectedNumbers(ctx) {
    // Verifica se ctx.session.selectedNumbers é um array
    if (Array.isArray(ctx.session.selectedNumbers)) {
        // Filtra os valores null e NaN
        ctx.session.selectedNumbers = ctx.session.selectedNumbers.filter(number => number !== null && !isNaN(number));
    } else {
        // Se ctx.session.selectedNumbers não for um array, inicializa como um array vazio
        ctx.session.selectedNumbers = [];
    }
}

// Função para lidar com a validação do número de telefone
async function validatePhoneNumberAcumulado6(ctx) {
    ctx.session.awaitingPhoneNumberForGame = true;

    const salvarId = await ctx.editMessageCaption('Ficaremos felizes em entrar em contato contigo, caso seja um ganhador! Para isso, digite seu número de telefone com o DDD.');
    await ctx.session.mensagensIDS.push(salvarId.message_id);

    bot.on('text', async (ctx) => {
        const response = ctx.message.text.trim();

        if (isValidPhoneNumber(response) && ctx.session.awaitingPhoneNumberForGame) {
            userPhoneNumber = response;
            await deleteAllMessages(ctx);
            const selectedNumbers = [];
            const keyboard = await createNumericKeyboard(ctx, selectedNumbers);
            let message = await ctx.reply('Escolha seus 10 números:', Markup.inlineKeyboard(keyboard));
            let messageId = message.message_id;
            await ctx.session.mensagensIDS.push(messageId);
            mensagemEscolhaNumerosId = messageId;
            ctx.session.awaitingPhoneNumberForGame = false;

        } else if (ctx.session.awaitingPhoneNumberForGame && !isValidPhoneNumber(response)) {
            const salvarID3 = await ctx.reply('Número inválido. Por favor, digite um número válido.', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                        ]
                    ]
                }
            });
            await ctx.session.mensagensIDS.push(salvarID3.message_id);
        } else {
            const from = ctx.message.from;
            await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
                caption: `${from.first_name} ${from.last_name}, Seja Bem-Vindo ao Década da Sorte!`,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '⭐ Classificação', callback_data: 'menu_classificacao' },
                            { text: '📊 Resultados', callback_data: 'menu_resultados' }
                        ],
                        [
                            { text: '🎮 Jogar', callback_data: 'menu_jogar' },
                            { text: 'ℹ️ Informações sobre Jogo', callback_data: 'menu_informacoes' }
                        ],
                        [
                            { text: '🔗 Link de Indicação', callback_data: 'link_indicacao' },
                            { text: '❓ Ajuda', callback_data: 'ajuda' }
                        ],
                        [
                            { text: '❖ Cadastrar Pix', callback_data: 'menu_cadastrar_pix' },
                        ]
                    ]
                }
            });
        }
    });
    setTimeout(() => { }, 1000);
}

// Função para excluir o teclado numérico junto com a mensagem "Escolha 10 números"
async function deleteNumericKeyboard(ctx, messageId) {
    try {
        await ctx.deleteMessage(messageId);
    } catch {}
}

// Função para criar o teclado numérico com 12 linhas e 5 colunas
function createNumericKeyboard(ctx, selectedNumbers) {
    const keyboard = [];
    let row = [];
    for (let i = 1; i <= 60; i++) {
        row.push(Markup.button.callback(`${i}`, `${i}`));
        if (i % 5 === 0) {
            keyboard.push(row);
            row = [];
        }
    }
    const confirmButton = Markup.button.callback('Confirmar', 'confirmar');
    keyboard.push([confirmButton, Markup.button.callback('Voltar', 'voltar')]);
    return keyboard;
}

bot.action('voltar', async (ctx) => {
    await deleteAllMessages(ctx);

    if (mensagemEscolhaNumerosId) {
        await deleteNumericKeyboard(ctx, mensagemEscolhaNumerosId);
        const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;

        const sentMessage2 = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
            caption: `${from.first_name} ${from.last_name}, Seja Bem-Vindo ao Década da Sorte!`,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '⭐ Classificação', callback_data: 'menu_classificacao' },
                        { text: '📊 Resultados', callback_data: 'menu_resultados' }
                    ],
                    [
                        { text: '🎮 Jogar', callback_data: 'menu_jogar' },
                        { text: 'ℹ️ Informações sobre Jogo', callback_data: 'menu_informacoes' }
                    ],
                    [
                        { text: '🔗 Link de Indicação', callback_data: 'link_indicacao' },
                        { text: '❓ Ajuda', callback_data: 'ajuda' }
                    ],
                    [
                        { text: '❖ Cadastrar Pix', callback_data: 'menu_cadastrar_pix' },
                    ]
                ]
            }
        });
        ctx.session.mensagensIDS.push(sentMessage2.message_id);
        mensagemEscolhaNumerosId = null;
    } else {
        const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;
        const sentMessage2 = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
            caption: `${from.first_name} ${from.last_name}, Seja Bem-Vindo ao Década da Sorte!`,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '⭐ Classificação', callback_data: 'menu_classificacao' },
                        { text: '📊 Resultados', callback_data: 'menu_resultados' }
                    ],
                    [
                        { text: '🎮 Jogar', callback_data: 'menu_jogar' },
                        { text: 'ℹ️ Informações sobre Jogo', callback_data: 'menu_informacoes' }
                    ],
                    [
                        { text: '🔗 Link de Indicação', callback_data: 'link_indicacao' },
                        { text: '❓ Ajuda', callback_data: 'ajuda' }
                    ],
                    [
                        { text: '❖ Cadastrar Pix', callback_data: 'menu_cadastrar_pix' },
                    ]
                ]
            }
        });
        ctx.session.mensagensIDS.push(sentMessage2.message_id);
    }
    setTimeout(() => { }, 1000);
});

bot.action(/^[1-9]\d*$/, async (ctx) => {
    const number = parseInt(ctx.match[0]);
    if (!ctx.session.selectedNumbers) {
        ctx.session.selectedNumbers = [];
    }
    const index = ctx.session.selectedNumbers.indexOf(number);
    if (index === -1) {
        if (ctx.session.selectedNumbers.length >= 10) {
            const salvarID = await ctx.reply('Por favor, selecione EXATAMENTE 10 números, se for o caso substitua algum número não desejado, por outro desejado...');
            ctx.session.mensagensIDS.push(salvarID.message_id);
            return 
        }
        ctx.session.selectedNumbers.push(number);
    } else {
        ctx.session.selectedNumbers.splice(index, 1);
    }
    const keyboardData = await createNumericKeyboard(ctx, ctx.session.selectedNumbers);
    const keyboard = keyboardData.map(row => {
        return row.map(button => {
            if (ctx.session.selectedNumbers.includes(parseInt(button.callback_data))) {
                return Markup.button.callback(`${button.callback_data} ✅`, `${button.callback_data}`);
            } else {
                return button;
            }
        });
    });
    const salvarId5 = await ctx.editMessageText('Escolha os seus 10 números:', Markup.inlineKeyboard(keyboard));
    ctx.session.mensagensIDS.push(salvarId5.message_id);
    ctx.session.lastKeyboard = keyboard;
});

async function handleConfirmAction(ctx) {
    await deleteAllMessages(ctx);
    validateSelectedNumbers(ctx);
    console.log(ctx.session.selectedNumbers)
    if (ctx.session.selectedNumbers.length < 10) {
        const salvarID =  await ctx.reply('Por favor, selecione exatamente 10 números antes de confirmar.');
        ctx.session.mensagensIDS.push(salvarID.message_id);
    }

    if (ctx.session.selectedNumbers.length === 10) {
        const confirm_NumerosButton = Markup.button.callback('Confirmar Números', 'confirmar_Numeros');
        const alterar_NumerosButton = Markup.button.callback('Alterar Números', 'alterar_Numeros');
        const keyboard = [[confirm_NumerosButton, alterar_NumerosButton]];
        const salvarId = await ctx.reply(`Confirme os Números Selecionados: \n${ctx.session.selectedNumbers.sort((a, b) => a - b).join('  ')}`, Markup.inlineKeyboard(keyboard));
        if (salvarId && salvarId.message_id) {
            ctx.session.mensagensIDS.push(salvarId.message_id);
        }
    } else {
        const number = parseInt(ctx.match[0]);
        if (!ctx.session.selectedNumbers) {
            ctx.session.selectedNumbers = [];
        }
        const index = ctx.session.selectedNumbers.indexOf(number);
        if (index === -1) {
            if (ctx.session.selectedNumbers.length < 10) {
                ctx.session.selectedNumbers.push(number);
            }
        } else {
            ctx.session.selectedNumbers.splice(index, 1);
        }

        const keyboardData = await createNumericKeyboard(ctx, ctx.session.selectedNumbers);
        const keyboard = keyboardData.map(row => {
            return row.map(button => {
                if (ctx.session.selectedNumbers.includes(parseInt(button.callback_data))) {
                    return Markup.button.callback(`${button.callback_data} ✅`, `${button.callback_data}`);
                } else {
                    return button;
                }
            });
        });
        const salvarId = await ctx.reply('Por favor selecione EXATAMENTE 10 números:', Markup.inlineKeyboard(keyboard));
        if (salvarId && salvarId.message_id) {
            ctx.session.mensagensIDS.push(salvarId.message_id);
        }
        if (ctx.session.selectedNumbers.length === 10) {
            await handleConfirmAction(ctx);
        }
    }
    setTimeout(() => { }, 1000);
}

bot.action('confirmar', handleConfirmAction);

bot.action('confirmar_Numeros', async (ctx) => {
    await deleteAllMessages(ctx);

    if (mensagemEscolhaNumerosId) {
        await deleteNumericKeyboard(ctx, mensagemEscolhaNumerosId);
        mensagemEscolhaNumerosId = null;
    }

    if (ctx.session.selectedNumbers.length === 10) {
        try {
            await salvarNumerosSelecionadosAcumulado6(ctx.session.selectedNumbers, ctx);
            const { id, qrCodeData, qrCodeBase64 } = await gerarQRCodePix();
            await inserirIDPagamentoNaPlanilha(id);
            const salvarId = await ctx.replyWithPhoto({ source: 'Logo3.jpg' });
            const salvarId1 = await ctx.reply('PIX Gerado com Sucesso\n\n📸 Aponte a Camera do seu celular para ler QR-Code\n\n💰 Valor da Cota R$25,00\n\n⏰ Este pagamento ficará disponível por 40 minutos\n');
            const salvarId2 = await ctx.replyWithPhoto({ source: Buffer.from(qrCodeBase64, 'base64') });
            const salvarId3 = await ctx.reply('\n💠💠 PIX Copia e Cola 👇👇\n');
            const voltarButton = { text: '🏠 Menu Inicial', callback_data: 'voltar' };
            const salvarId4 = await ctx.reply('\n' + qrCodeData, { reply_markup: { inline_keyboard: [[voltarButton]] } });
            if (salvarId1 && salvarId2 && salvarId3 && salvarId4) {
                ctx.session.mensagensIDS.push(salvarId.message_id);
                ctx.session.mensagensIDS.push(salvarId1.message_id);
                ctx.session.mensagensIDS.push(salvarId2.message_id);
                ctx.session.mensagensIDS.push(salvarId3.message_id);
                ctx.session.mensagensIDS.push(salvarId4.message_id);
            }

        } catch (error) {
            console.error('Erro ao processar ação confirmar_Numeros:', error);
            const salvarId = await ctx.reply('Ocorreu um erro ao processar sua solicitação.');
            if (salvarId) {
                ctx.session.mensagensIDS.push(salvarId.message_id);
            }
        }
    } else {
        ctx.reply('Por favor, selecione exatamente 10 números antes de confirmar.');
    }
});

async function gerarQRCodePix() {
    try {
        const expire = new Date();
        expire.setMinutes(expire.getMinutes() + 40);
        const paymentData = {
            transaction_amount: 0.01,
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

        const accessToken = process.env.accessToken;

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

async function inserirIDPagamentoNaPlanilha(idUnico) {
    const fileName = 'NumerosSelecionadosAcumulado6.xlsx';

    let release;
    try {
        release = await lockfile.lock(fileName);

        if (fs.existsSync(fileName)) {
            const workbook = xlsx.readFile(fileName);
            const worksheet = workbook.Sheets['NumerosSelecionadosAcumulado6'];

            const idPagamentoColumn = 'D';
            let targetRowIndex = 1;

            for (let rowIndex = 1; ; rowIndex++) {
                const cellAddress = idPagamentoColumn + rowIndex;
                const cell = worksheet[cellAddress];

                if (!cell || !cell.v) {
                    targetRowIndex = rowIndex;
                    break;
                }
            }

            const cellAddress = idPagamentoColumn + targetRowIndex;
            worksheet[cellAddress] = { t: 's', v: idUnico };

            xlsx.writeFile(workbook, fileName);
        } else {
            throw new Error('Arquivo da planilha não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao inserir ID do pagamento na planilha:', error.message);
        throw error;
    } finally {
        if (release) {
            await release();
        }
    }
}

bot.action('alterar_Numeros', async (ctx) => {
    ctx.session.selectedNumbers = [];
    const keyboard = createNumericKeyboard(ctx, ctx.session.selectedNumbers);
    const salvarId = await ctx.editMessageText('Escolha 10 números:', Markup.inlineKeyboard(keyboard));
    if (salvarId) {
        ctx.session.mensagensIDS.push(salvarId.message_id);
    }
});

function salvarNumerosSelecionadosAcumulado6(selectedNumbers, ctx) {
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

    if (fs.existsSync(filePath)) {
        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets['NumerosSelecionadosAcumulado6'];
        const data = [{
            Nome: nomeUsuario,
            ID: id,
            Telefone: userPhoneNumber,
            idPagamento: '',
            ...selectedNumbers.reduce((obj, number, index) => {
                obj[`N${index + 1}`] = number;
                return obj;
            }, {}),
            Pagamento: pagamento
        }];
        xlsx.utils.sheet_add_json(worksheet, data, { origin: -1, skipHeader: true });
        xlsx.writeFile(workbook, filePath);
    } else {
        const worksheetData = [{
            Nome: nomeUsuario,
            ID: id,
            Telefone: userPhoneNumber,
            idPagamento: '',
            ...selectedNumbers.reduce((obj, number, index) => {
                obj[`N${index + 1}`] = number;
                return obj;
            }, {}),
            Pagamento: pagamento
        }];
        const worksheet = xlsx.utils.json_to_sheet(worksheetData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'NumerosSelecionadosAcumulado6');
        xlsx.writeFile(workbook, filePath);
    }
}

// Função de manuseio de texto específico para o jogo acumulado 6
function handleJogoAcumulado6Text(ctx) {
    const response = ctx.message.text.trim();
    if (isValidPhoneNumber(response)) {
        ctx.session.awaitingPhoneNumberForGame = false;
        userPhoneNumber = response;
        ctx.reply('Número de telefone válido. Agora, por favor, escolha seus números.');
        const keyboard = createNumericKeyboard(ctx, []);
        ctx.reply('Escolha 10 números:', Markup.inlineKeyboard(keyboard));
    } else {
        ctx.reply('Número inválido. Por favor, digite um número válido.');
    }
}

module.exports = {
    createNumericKeyboard,
    salvarNumerosSelecionadosAcumulado6,
    validatePhoneNumberAcumulado6,
    handleJogoAcumulado6Text, 
    isValidPhoneNumber,
    gerarQRCodePix,
    inserirIDPagamentoNaPlanilha,
    deleteAllMessages,
    deleteNumericKeyboard
};
