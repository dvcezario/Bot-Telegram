const { Markup } = require('telegraf');
const bot = require('./bot');
const MENU_INICIAL = 'menu_inicial';
const telegraf = require('telegraf');
const session = require('telegraf/session');
const bot2 = new telegraf.Telegraf(process.env.TOKEN);

let mensagensIDS = [];

async function apresentarTelaInicial(ctx) {
    try {
        const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;

        if (ctx.callbackQuery) {
            if (!ctx.callbackQuery.message || !ctx.callbackQuery.message.caption) {
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);

                    apresentarTelaInicial(ctx);
                }
                catch (error) {
                    console.error('Erro ao excluir as mensagens', error);
                }
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
        } else {
            const sentMessage = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
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
            ctx.session.mensagensIDS.push(sentMessage.message_id);
        }
    } catch (error) {
        console.error('Estou no Catch', error);
    }
}

async function deleteAllMessages(ctx) {
    try {
        for (let i = ctx.session.mensagensIDS.length - 1; i >= 0; i--) {
            const id = ctx.session.mensagensIDS[i];
            try {
                if (id && ctx.session.mensagensIDS.includes(id)) {
                    await ctx.telegram.deleteMessage(ctx.chat.id, id);
                    ctx.session.mensagensIDS.splice(i, 1);
                }
            } catch {
            }
        }
        ctx.session.mensagensIDS = [];
    } catch {
    }
}

module.exports = {
    apresentarTelaInicial,
    MENU_INICIAL,
    deleteAllMessages,
    mensagensIDS,
};