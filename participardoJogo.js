// participandodoJogo.js

require('dotenv').config();

const fs = require('fs');
const xlsx = require('xlsx');
const { Markup } = require('telegraf');
const axios = require('axios');
const crypto = require('crypto');
const Telegraf = require('telegraf');
const session = require('telegraf/session');
const { mensagensIDS, deleteAllMessages } = require('./telaInicial');
const { apresentarTelaInicial } = require('./telaInicial');
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
async function validatePhoneNumber(ctx) {
    // Inicializa ctx.session.awaitingPhoneNumber
    ctx.session.awaitingPhoneNumber = true;

    // Pergunta ao usuário para digitar o número de telefone
    const salvarId = await ctx.editMessageCaption('Ficaremos felizes em entrar em contato contigo, caso seja um ganhador! Para isso, digite seu número de telefone com o DDD.');
    await ctx.session.mensagensIDS.push(salvarId.message_id);

    bot.on('text', async (ctx) => { // Torna a função de callback assíncrona
        const response = ctx.message.text.trim();

        if (isValidPhoneNumber(response) && ctx.session.awaitingPhoneNumber) {
            // Após a validação bem-sucedida, armazena o número de telefone na variável global
            userPhoneNumber = response;

            // Deleta todas as mensagens anteriores
            await deleteAllMessages(ctx);

            // Após a validação bem-sucedida, chama a função createNumericKeyboard
            const selectedNumbers = []; // Substitua isso pela lista de números selecionados
            const keyboard = await createNumericKeyboard(ctx, selectedNumbers);
            let message = await ctx.reply('Escolha seus 10 números:', Markup.inlineKeyboard(keyboard));
            let messageId = message.message_id;
            await ctx.session.mensagensIDS.push(messageId);

            // Armazena o message_id da mensagem "Escolha 10 números"
            mensagemEscolhaNumerosId = messageId;
            ctx.session.awaitingPhoneNumber = false;

        } else if (ctx.session.awaitingPhoneNumber && !isValidPhoneNumber(response)) {
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
        }

        else {
            // Define o from
            const from = ctx.message.from;

            // Envia a tela inicial
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
        // Exclui a mensagem anterior junto com o teclado criado
        await ctx.deleteMessage(messageId);
    } catch {
    }
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
    // Adiciona botões confirmar e voltar
    const confirmButton = Markup.button.callback('Confirmar', 'confirmar');
    keyboard.push([confirmButton, Markup.button.callback('Voltar', 'voltar')]);
    return keyboard;
}

// Função para lidar com o botão voltar
bot.action('voltar', async (ctx) => {

    // Deleta todas as mensagens
    await deleteAllMessages(ctx);

    // Deleta apenas o teclado numérico junto com a mensagem "Escolha 10 números"
    if (mensagemEscolhaNumerosId) {
        // Chama a função para excluir o teclado numérico
        await deleteNumericKeyboard(ctx, mensagemEscolhaNumerosId);

        // Define o from
        const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;

        // Envia a mensagem do menu inicial.
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
                    ]
                ]
            }
        });
        ctx.session.mensagensIDS.push(sentMessage2.message_id);

        // Limpa o ID da mensagem após excluir
        mensagemEscolhaNumerosId = null;
    } else {
        // Define o from
        const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;

        // Envia a mensagem do menu inicial.
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
                    ]
                ]
            }
        });
        ctx.session.mensagensIDS.push(sentMessage2.message_id);
    }
    setTimeout(() => { }, 1000);
});

// Função para lidar com a seleção de números
bot.action(/^[1-9]\d*$/, async (ctx) => {
    const number = parseInt(ctx.match[0]);
    if (!ctx.session.selectedNumbers) {
        ctx.session.selectedNumbers = [];
    }
    const index = ctx.session.selectedNumbers.indexOf(number);
    if (index === -1) {
        // Verifica se o usuário já selecionou 10 números
        if (ctx.session.selectedNumbers.length > 10) {
            // Se o usuário já selecionou 10 números, envie uma mensagem e não permita que ele selecione mais
            const salvarID = await ctx.reply('Por favor, selecione EXATAMENTE 10 números, se for o caso substitua algum número não desejado, por outro desejado...');
            ctx.session.mensagensIDS.push(salvarID.message_id);
            return 
        }
        // Adiciona o número selecionado
        ctx.session.selectedNumbers.push(number);
    } else {
        // Remove o número deselecionado
        ctx.session.selectedNumbers.splice(index, 1);
    }
    // Atualiza o teclado com os números selecionados
    const keyboardData = await createNumericKeyboard();
    const keyboard = keyboardData.map(row => {
        return row.map(button => {
            if (ctx.session.selectedNumbers.includes(parseInt(button.callback_data))) {
                // Muda a cor do botão se estiver selecionado
                return Markup.button.callback(`${button.callback_data} ✅`, `${button.callback_data}`);
            } else {
                return button;
            }
        });
    });
    // Restante do código...
    const salvarId5 = await ctx.editMessageText('Escolha os seus 10 números:', Markup.inlineKeyboard(keyboard));
    ctx.session.mensagensIDS.push(salvarId5.message_id);
    ctx.session.lastKeyboard = keyboard;
});

// Função para lidar com a ação confirmar
async function handleConfirmAction(ctx) {
    await deleteAllMessages(ctx);
    validateSelectedNumbers(ctx);
    console.log(ctx.session.selectedNumbers)
    if (ctx.session.selectedNumbers.length < 10) {
    const salvarID =  await ctx.reply('Por favor, selecione exatamente 10 números antes de confirmar.');
    ctx.session.mensagensIDS.push(salvarID.message_id);
    }

    if (ctx.session.selectedNumbers.length === 10) {
        // Adiciona botões confirmar_Numeros e alterar_Numeros
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
            // Adiciona o número selecionado
            if (ctx.session.selectedNumbers.length < 10) {
                ctx.session.selectedNumbers.push(number);
            }
        } else {
            // Remove o número deselecionado
            ctx.session.selectedNumbers.splice(index, 1);
        }

        // Atualiza o teclado com os números selecionados
        const keyboardData = await createNumericKeyboard();
        const keyboard = keyboardData.map(row => {
            return row.map(button => {
                if (ctx.session.selectedNumbers.includes(parseInt(button.callback_data))) {
                    // Muda a cor do botão se estiver selecionado
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
        // Se um número válido foi selecionado, chame a função handleConfirmAction novamente
        if (ctx.session.selectedNumbers.length === 10) {
            await handleConfirmAction(ctx);
        }

    }
    setTimeout(() => { }, 1000);
}

// Ação do bot para confirmar
bot.action('confirmar', handleConfirmAction);


bot.action('confirmar_Numeros', async (ctx) => {
    // Apaga todas as mensagens anteriores
    await deleteAllMessages(ctx);

    // Chama a função de deletar Keyboard
    if (mensagemEscolhaNumerosId) {
        await deleteNumericKeyboard(ctx, mensagemEscolhaNumerosId);
        mensagemEscolhaNumerosId = null;
    }

    if (ctx.session.selectedNumbers.length === 10) {
        try {
            await salvarNumerosSelecionados(ctx.session.selectedNumbers, ctx);
            const { id, qrCodeData, qrCodeBase64 } = await gerarQRCodePix();
            await inserirIDPagamentoNaPlanilha(id);
            const salvarId = await ctx.replyWithPhoto({ source: 'Logo3.jpg' });
            const salvarId1 = await ctx.reply('PIX Gerado com Sucesso\n\n📸 Aponte a Camera do seu celular para ler QR-Code\n\n💰 Valor da Cota R$25,00\n\n⏰ Este pagamento ficará disponível por 40 minutos\n');
            const salvarId2 = await ctx.replyWithPhoto({ source: Buffer.from(qrCodeBase64, 'base64') });
            const salvarId3 = await ctx.reply('\n💠💠 PIX Copia e Cola 👇👇\n');
            const voltarButton = { text: '🏠 Menu Inicial', callback_data: 'voltar' }; // Cria o botão de voltar
            const salvarId4 = await ctx.reply('\n' + qrCodeData, { reply_markup: { inline_keyboard: [[voltarButton]] } }); // Envia o botão de voltar);
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
        expire.setMinutes(expire.getMinutes() + 40); // Definindo a validade para 40 minutos
        const paymentData = {
            transaction_amount: 0.01,
            date_of_expiration: expire.toISOString(), // Definindo a data de expiração
            description: 'Década da Sorte',
            payment_method_id: 'pix',
            payer: {
                email: 'diego-cezario@hotmail.com',
                identification: {
                    type: 'CPF',
                    number: '07396756642'
                }
            }
        };

        // PUXA DO .ENV
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
    const fileName = 'NumerosSelecionados.xlsx';

    try {
        if (fs.existsSync(fileName)) {
            const workbook = xlsx.readFile(fileName);
            const worksheet = workbook.Sheets['NumerosSelecionados'];

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
    }
}


// Função para lidar com o botão alterar_Numeros
bot.action('alterar_Numeros', async (ctx) => {
    ctx.session.selectedNumbers = []; // Limpar os números selecionados
    const keyboard = createNumericKeyboard(selectedNumbers);
    const salvarId = await ctx.editMessageText('Escolha 10 números:', Markup.inlineKeyboard(keyboard));
    if (salvarId) {
        ctx.session.mensagensIDS.push(salvarId.message_id);
    }
});

// Função para salvar os números selecionados em uma planilha do Excel
function salvarNumerosSelecionados(selectedNumbers, ctx) {
    const fileName = 'NumerosSelecionados.xlsx';
    let nomeUsuario = '';
    let id = '';
    if (ctx.update.callback_query && ctx.update.callback_query.from) {
        nomeUsuario = `${ctx.update.callback_query.from.first_name || ''} ${ctx.update.callback_query.from.last_name || ''}`;
        id = ctx.update.callback_query.from.id || '';
    }
    const pagamento = 'Não';

    // Ordena os números selecionados em ordem crescente
    selectedNumbers.sort((a, b) => a - b);

    // Verifica se o arquivo já existe
    if (fs.existsSync(fileName)) {
        // Se o arquivo existe, apenas abre e adiciona os dados na linha de baixo
        const workbook = xlsx.readFile(fileName);
        const worksheet = workbook.Sheets['NumerosSelecionados'];
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
        xlsx.writeFile(workbook, fileName);
    } else {
        // Se o arquivo não existe, cria um novo com o formato desejado
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
        xlsx.utils.book_append_sheet(workbook, worksheet, 'NumerosSelecionados');
        xlsx.writeFile(workbook, fileName);
    }
}

module.exports = {
    createNumericKeyboard,
    salvarNumerosSelecionados,
    validatePhoneNumber,
    isValidPhoneNumber,
    gerarQRCodePix,
    inserirIDPagamentoNaPlanilha,
    deleteAllMessages,
    bot,
    deleteNumericKeyboard
};