require('dotenv').config({ path: __dirname + '/.env' });
const token = process.env.token;

const { Markup } = require('telegraf');
const bot = require('./bot');
const session = require('telegraf/session');
const { proximaRodadaData } = require('./config');

const { deleteAllMessages } = require('./telaInicial');
const fs = require('fs');
const resultados = require('./resultados')
const jogoAcumulado6 = require('./jogoAcumulado6');
const jogoAcumulado10 = require('./jogoAcumulado10');
const jogoTiroCerto = require('./jogoTiroCerto');
const path = require('path');   
const photoPath = path.join(__dirname, 'Logo3.jpg');

const { apresentarTelaInicial, MENU_INICIAL } = require('./telaInicial');
const { apresentarMenuClassificacao, apresentarMenuResultados, apresentarMenuJogar, apresentarInformacoesJogo, apresentarMenuLinkIndicacao, apresentarMenuAjuda, apresentarMenuCadastrarPix, apresentarSubMenuAcertoAcumulado, apresentarSubMenuAcertoAcumulado6, apresentarSubMenuAcertoAcumulado10, apresentarSubMenuTiroCerto } = require('./menu');
const { apresentarTodosResultados, apresentarResultadoAnterior, apresentarResultadoProximo } = require('./resultados');
const { apresentarClassificacaoGeral, apresentarClassificacaoRodada } = require('./classificacao');
const { apresentarPremiacoes, apresentarPlanilhaJogadores } = require('./jogar');
    
const { validatePhoneNumberAcumulado6, handleJogoAcumulado6Text } = require('./jogoAcumulado6');
const { validatePhoneNumberAcumulado10 } = require('./jogoAcumulado10');
const { validatePhoneNumberTiroCerto } = require('./jogoTiroCerto');
const { enviarVideoExplicativo, enviarTextoExplicativo, enviarInformacoesPagamento, enviarInformacoesRecebimento } = require('./menuInformacoes');
const { cadastrarPixCPF_CNPJ, cadastrarPixEmail, cadastrarPixCelular, cadastrarPixChaveAleatoria, obterCPF_CNPJ, obterEmail, obterCelular, obterChaveAleatoria, obterNomeRecebedor, obterNomeBanco, obterNumeroTelefone } = require('./cadastrarPix');
const mercadopago = require('./mercadopago');
const { mensagensIDS } = require('./telaInicial');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Remover duplicidade de chamar a tela inicial em bot.start
bot.start(async (ctx, next) => {
    // Initialize ctx.session.mensagensIDS if it doesn't exist
    if (!ctx.session) {
        ctx.session = {};
    }
    if (!ctx.session.mensagensIDS) {
        ctx.session.mensagensIDS = [];
    }
    if (ctx.session.mensagensIDS.length > 0) {
        await deleteAllMessages(ctx);
    }
    apresentarTelaInicial(ctx);
});


bot.action('menu_classificacao', apresentarMenuClassificacao);
bot.action('menu_resultados', apresentarMenuResultados);
bot.action('menu_jogar', apresentarMenuJogar);
bot.action('classificacao_geral', apresentarClassificacaoGeral);
bot.action('classificacao_rodada', apresentarClassificacaoRodada);
bot.action('resultado_anterior', apresentarResultadoAnterior);
bot.action('resultado_proximo', apresentarResultadoProximo);

bot.action('voltar', async (ctx) => {
    await deleteAllMessages(ctx);
    const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;

    await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
        caption: `${from.first_name} ${from.last_name}, Seja Bem-Vindo ao Década da Sorte! Próxima rodada inicia-se ${proximaRodadaData}`,
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
});

bot.action('todos_resultados', apresentarTodosResultados);
bot.action('acerto_acumulado6', apresentarSubMenuAcertoAcumulado6);
bot.action('acerto_acumulado10', apresentarSubMenuAcertoAcumulado10);
bot.action('tiro_certo', apresentarSubMenuTiroCerto);
bot.action('premiacoes', apresentarPremiacoes);
bot.action('planilha_jogadores', apresentarPlanilhaJogadores);
bot.action('ajuda', apresentarMenuAjuda);
bot.action('link_indicacao', apresentarMenuLinkIndicacao);
bot.action('menu_informacoes', apresentarInformacoesJogo);
bot.action('video_explicativo', enviarVideoExplicativo);
bot.action('texto_explicativo', enviarTextoExplicativo);
bot.action('informacoes_pagamento', enviarInformacoesPagamento);
bot.action('informacoes_recebimento', enviarInformacoesRecebimento);

let isSending = false;

bot.command('classificacao', async (ctx) => {
    if (isSending) return;
    isSending = true;
    try {
        if (mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, mensagensIDS[0]);
            mensagensIDS.shift();
        }
        const photoPath = path.join(__dirname, 'Logo3.jpg');
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Selecione o tipo de classificação:',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '👑 Classificação Geral', callback_data: 'classificacao_geral' }
                    ],
                    [
                        { text: '🎖️ Classificação da Rodada', callback_data: 'classificacao_rodada' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        await ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
});

bot.command('jogar', async (ctx) => {
    if (isSending) return;
    isSending = true;
    try {
        if (mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, mensagensIDS[0]);
            mensagensIDS.shift();
        }
        const photoPath = path.join(__dirname, 'Logo3.jpg');
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Selecione uma opção para jogar:',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🎱 Acumulado - 10 Números 6 Acertos', callback_data: 'acerto_acumulado6' }
                    ],
                    [
                        { text: '🎱 Acumulado - 10 Números 10 Acertos', callback_data: 'acerto_acumulado10' }
                    ],
                    [
                        { text: '🎯 Tiro Certo - Maior Pontuador', callback_data: 'tiro_certo' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        await ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
});

bot.command('indicacao', async (ctx) => {
    if (isSending) return;
    isSending = true;
    try {
        if (mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, mensagensIDS[0]);
            mensagensIDS.shift();
        }
        const photoPath = path.join(__dirname, 'Logo3.jpg');
        const photo = fs.readFileSync(photoPath);

        const contadorIndicacoes = 0;
        const ultimaIndicacao = 'N/A';
        const linkBotTelegram = 'https://t.me/your_bot';

        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: `
            💰 Ganhe bônus de 15% da aposta do seu indicado.\n\n📈 Indicações: ${contadorIndicacoes}\n🏷 Última indicação: ${ultimaIndicacao}\n\n🔗 Link\n${linkBotTelegram}
            `,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        await ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
});

bot.command('ajuda', async (ctx) => {
    if (isSending) return;
    isSending = true;
    try {
        if (mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, mensagensIDS[0]);
            mensagensIDS.shift();
        }
        const photoPath = path.join(__dirname, 'Logo3.jpg');
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Precisa de ajuda? Estamos aqui para ajudar!',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💬 Atendimento Humano Telegram', url: 'https://t.me/Decada_da_Sorte' }
                    ],
                    [
                        { text: '💬 Atendimento Humano WhatsApp', url: 'https://wa.me/5531995384968?text=Ol%C3%A1%2C+quero+participar+do+D%C3%A9cada+da+Sorte%21' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        await ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
});

bot.command('informacoes', async (ctx) => {
    if (isSending) return;
    isSending = true;
    try {
        if (mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, mensagensIDS[0]);
            mensagensIDS.shift();
        }
        const photoPath = path.join(__dirname, 'Logo3.jpg');
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Informações sobre Jogo',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📹 Vídeo Explicativo', callback_data: 'video_explicativo' },
                        { text: '📄 Texto Explicativo', callback_data: 'texto_explicativo' }
                    ],
                    [
                        { text: '💳 Pagamento do Jogo', callback_data: 'informacoes_pagamento' },
                        { text: '💰 Recebimento do Prêmio', callback_data: 'informacoes_recebimento' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        await ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
});

bot.command('resultados', async (ctx) => {
    if (isSending) return;
    isSending = true;
    try {
        if (mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, mensagensIDS[0]);
            mensagensIDS.shift();
        }
        const photoPath = path.join(__dirname, 'Logo3.jpg');
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Selecione quais Resultados:',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🍀 Todos', callback_data: 'todos_resultados' },
                        { text: '🍀 Concurso', callback_data: 'buscar_concurso' },
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        await ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
});

bot.action('buscar_concurso', async (ctx) => {
    let message;
    if (ctx.callbackQuery.message.text) {
        message = await ctx.editMessageText('Por favor, digite o número do concurso:');
    } else if (ctx.callbackQuery.message.photo) {
        message = await ctx.editMessageCaption('Por favor, digite o número do concurso:');
    }
    bot.on('text', async (ctx) => {
        const numeroConcurso = parseInt(ctx.message.text.trim(), 10);
        const resultado = await obterResultadoPorConcurso(numeroConcurso, ctx);
        if (!resultado) {
            const buttons = criarBotoesPadrao();
            const salvarID = await ctx.replyWithMarkdown('Resultado não encontrado para o concurso informado.', Markup.inlineKeyboard(buttons));
            if (salvarID) {
                ctx.session.mensagensIDS.push(salvarID.message_id);
            }
            return;
        }

        const formattedResult = formatarResultado(resultado);
        const buttons = criarBotoesPadrao();
        const concursoBuscado = await ctx.reply(formattedResult, Markup.inlineKeyboard(buttons));
        if (concursoBuscado) {
            ctx.session.mensagensIDS.push(concursoBuscado.message_id);
        }
    });
    if (message) {
        ctx.session.mensagensIDS.push(message.message_id);
    }
});

bot.action('menu_cadastrar_pix', apresentarMenuCadastrarPix);
bot.action('cadastrar_pix_cpf_cnpj', cadastrarPixCPF_CNPJ);
bot.action('cadastrar_pix_email', cadastrarPixEmail);
bot.action('cadastrar_pix_celular', cadastrarPixCelular);
bot.action('cadastrar_pix_aleatoria', cadastrarPixChaveAleatoria);

bot.on('text', (ctx) => {
    if (ctx.session.awaitingPhoneNumberForPix) {
        handlePixText(ctx);
    } else if (ctx.session.awaitingPhoneNumberForGame) {
        handleJogoAcumulado6Text(ctx); // Use a função corretamente
    } else {
        // Outras manipulações específicas para o jogo
        ctx.reply('Comando ou texto não reconhecido.');
    }
});

bot.on('text', (ctx) => {
    if (ctx.session.step) {
        switch (ctx.session.step) {
            case 'obterCPF_CNPJ':
                obterCPF_CNPJ(ctx);
                break;
            case 'obterEmail':
                obterEmail(ctx);
                break;
            case 'obterCelular':
                obterCelular(ctx);
                break;
            case 'obterChaveAleatoria':
                obterChaveAleatoria(ctx);
                break;
            case 'obterNomeRecebedor':
                obterNomeRecebedor(ctx);
                break;
            case 'obterNomeBanco':
                obterNomeBanco(ctx);
                break;
            case 'obterNumeroTelefone':
                obterNumeroTelefone(ctx);
                break;
            default:
                ctx.reply('Por favor, use um comando válido para iniciar o cadastro.');
        }
    } else if (ctx.session.awaitingPhoneNumberForGame) {
        handleJogoAcumulado6Text(ctx);
    } else {
        ctx.reply('Por favor, use um comando válido para iniciar o cadastro.');
    }
});

bot.action('participar_jogo_acumulado6', (ctx) => {
    validatePhoneNumberAcumulado6(ctx, ctx.from.phone_number);
});

bot.action('participar_jogo_acumulado10', (ctx) => {
    validatePhoneNumberAcumulado10(ctx, ctx.from.phone_number);
});

bot.action('participar_jogo_tiro_certo', (ctx) => {
    validatePhoneNumberTiroCerto(ctx, ctx.from.phone_number);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
