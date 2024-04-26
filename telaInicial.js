const { Markup } = require('telegraf');
const bot = require('./bot');
const MENU_INICIAL = 'menu_inicial';
const telegraf = require('telegraf');
const session = require('telegraf/session');
const bot2 = new telegraf.Telegraf(process.env.TOKEN);

let mensagensIDS = [];

async function apresentarTelaInicial(ctx) {
    try {
        await deleteAllMessages(ctx);

        const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;

        if (ctx.callbackQuery) {
            if (!ctx.callbackQuery.message || !ctx.callbackQuery.message.caption) {
                try {
                    deleteAllMessages(ctx);
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
                await ctx.session.mensagensIDS.push(sentMessage2.message_id);
                console.log(ctx.session.mensagensIDS);

            }
            const salvarId = await ctx.editMessageCaption(`${from.first_name} ${from.last_name}, Seja Bem-Vindo ao Década da Sorte!`, {
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
                },
                parse_mode: 'Markdown',

            });
            await ctx.session.mensagensIDS.push(salvarId.message_id)
            console.log(ctx.session.mensagensIDS);
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
            await ctx.session.mensagensIDS.push(sentMessage.message_id);
            console.log(ctx.session.mensagensIDS);

        }
    } catch (error) {
        console.error('Estou no Catch');
    }
}

async function deleteAllMessages(ctx) {
    mensagensIDS = mensagensIDS.filter(item => item !== undefined);
    if (mensagensIDS.length > 0) {
        try {
            for (let i = mensagensIDS.length - 1; i >= 0; i--) {
                await ctx.telegram.deleteMessage(ctx.chat.id, mensagensIDS[i]);
                mensagensIDS.splice(i, 1);
            }
        } catch {
        }
    } else {
        console.log('Não há mensagens para excluir');
    }
}

module.exports = {
    apresentarTelaInicial,
    MENU_INICIAL,
    deleteAllMessages,
    mensagensIDS,
};