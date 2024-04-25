// index.js
require('dotenv').config();
const token = process.env.TOKEN;
const apiUrl = process.env.API_URL.replace('${TOKEN}', token);
const apiFileUrl = process.env.API_FILE_URL.replace('${TOKEN}', token);
const { Markup } = require('telegraf');
const bot = require('./bot');
const { mensagensIDS } = require('./telaInicial');
const { deleteAllMessages } = require('./telaInicial');
const fs = require('fs');
const resultados = require('./resultados')
const participarDoJogo = require('./participardoJogo');
const path = require('path');
const photoPath = path.join(__dirname, 'Logo3.jpg');

const { apresentarTelaInicial, MENU_INICIAL } = require('./telaInicial');
const { apresentarMenuClassificacao, apresentarMenuResultados, apresentarMenuJogar, apresentarInformacoesJogo, apresentarMenuLinkIndicacao, apresentarMenuAjuda, apresentarSubMenuAcertoAcumulado } = require('./menu');
const { apresentarTodosResultados, apresentarResultadoAnterior, apresentarResultadoProximo } = require('./resultados');
const { apresentarClassificacaoGeral, apresentarClassificacaoRodada } = require('./classificacao');
const { apresentarPremiacoes, apresentarPlanilhaJogadores } = require('./jogar');
const { validatePhoneNumber } = require('./participardoJogo');
const { enviarVideoExplicativo, enviarTextoExplicativo, enviarInformacoesPagamento, enviarInformacoesRecebimento } = require('./menuInformacoes');
const mercadopago = require('./mercadopago');



bot.start(async (ctx, next) => {
    if (mensagensIDS.length > 0) {
        await ctx.telegram.deleteMessage(ctx.chat.id, mensagensIDS[0]);
        mensagensIDS.shift();
    }
    next();
}, apresentarTelaInicial);

bot.action('menu_classificacao', apresentarMenuClassificacao);
bot.action('menu_resultados', apresentarMenuResultados);
bot.action('menu_jogar', apresentarMenuJogar);
bot.action('classificacao_geral', apresentarClassificacaoGeral);
bot.action('classificacao_rodada', apresentarClassificacaoRodada);
bot.action('resultado_anterior', apresentarResultadoAnterior);
bot.action('resultado_proximo', apresentarResultadoProximo);
bot.action('voltar', apresentarTelaInicial);
bot.action('todos_resultados', apresentarTodosResultados);
bot.action('acerto_acumulado', apresentarSubMenuAcertoAcumulado);
bot.action('premiacoes', apresentarPremiacoes);
bot.action('planilha_jogadores', apresentarPlanilhaJogadores);
bot.action('ajuda', apresentarMenuAjuda);
bot.action('link_indicacao', apresentarMenuLinkIndicacao);
bot.action('menu_informacoes', apresentarInformacoesJogo);
bot.action('video_explicativo', enviarVideoExplicativo);
bot.action('texto_explicativo', enviarTextoExplicativo);
bot.action('informacoes_pagamento', enviarInformacoesPagamento);
bot.action('informacoes_recebimento', enviarInformacoesRecebimento);


// Digitar /classificao
bot.command('classificacao', async (ctx) => {
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
                    { text: '👑 Classificação Geral', callback_data: 'classificacao_geral' },
                    { text: '🎖️ Classificação da Rodada', callback_data: 'classificacao_rodada' }
                ],
                [
                    { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                ]
            ]
        }
    });
    mensagensIDS.push(salvarId.message_id);
    console.log(mensagensIDS);
});

// Digitar /jogar
bot.command('jogar', async (ctx) => {
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
                    { text: '🎱 Acerto Acumulado', callback_data: 'acerto_acumulado' }
                ],
                [
                    { text: '🎯 Tiro Certo', callback_data: 'tiro_certo' }
                ],
                [
                    { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                ]
            ]
        }
    });
    mensagensIDS.push(salvarId.message_id);
    console.log(mensagensIDS);
});

// Digitar /indicações
bot.command('indicacao', async (ctx) => {
    if (mensagensIDS.length > 0) {
        await ctx.telegram.deleteMessage(ctx.chat.id, mensagensIDS[0]);
        mensagensIDS.shift();
    }
    const photoPath = path.join(__dirname, 'Logo3.jpg');
    const photo = fs.readFileSync(photoPath);

    // Defina as variáveis aqui
    const contadorIndicacoes = 0; // Substitua por sua lógica
    const ultimaIndicacao = 'N/A'; // Substitua por sua lógica
    const linkBotTelegram = 'https://t.me/your_bot'; // Substitua por sua lógica

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
    mensagensIDS.push(salvarId.message_id);
    console.log(mensagensIDS);
});


// Digitar /ajuda
bot.command('ajuda', async (ctx) => {
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
                    { text: '💬 Atendimento Humano WhatsApp', url: 'https://wa.me/5531991142862?text=Ol%C3%A1%2C+quero+participar+do+D%C3%A9cada+da+Sorte%21' }
                ],
                [
                    { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                ]
            ]
        }
    });
    mensagensIDS.push(salvarId.message_id);
    console.log(mensagensIDS);
});

// Digitar /informacoes
bot.command('informacoes', async (ctx) => {
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
    mensagensIDS.push(salvarId.message_id);
    console.log(mensagensIDS);
});

// Digitar /resultados
bot.command('resultados', async (ctx) => {
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
    mensagensIDS.push(salvarId.message_id);
    console.log(mensagensIDS);
});












bot.action('participar_jogo', (ctx) => {
    validatePhoneNumber(ctx, ctx.from.phone_number);
});

bot.launch();