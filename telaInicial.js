const { Markup } = require('telegraf'); // Importe o Markup do Telegraf
const bot = require('./bot'); // Importe o bot aqui para evitar circularidade
const MENU_INICIAL = 'menu_inicial';

/**
 * Função para apresentar a tela inicial do bot.
 * @param {object} ctx O contexto da mensagem.
 */

let mensagensIDS = [];

async function apresentarTelaInicial(ctx) {
    try {
        const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;
        console.log(from);

        // Verifica se é uma callback query 
        if (ctx.callbackQuery) {

            if (!ctx.callbackQuery.message || !ctx.callbackQuery.message.caption) {
                console.log('Não tem legenda No If');
                console.log('MensagensIDS', mensagensIDS);
                try {
                    deleteCurrentMessage(ctx);
                    deleteAllMessages(ctx);
                }
                catch (error) {
                    console.error('Erro ao excluir as mensagens', error);
                }

                // É uma callback porém não tem legenda
                // Envia a foto e a mensagem de boas-vindas
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
                                { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                            ]
                        ]
                    }
                });
                // Armazene o message_id da última mensagem enviada
                mensagensIDS.push(sentMessage2.message_id);
            }
            // É uma callback porém tem legenda
            await ctx.editMessageCaption(`${from.first_name} ${from.last_name}, Seja Bem-Vindo ao Década da Sorte!`, {
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
                            { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            });
        } else {
            // Enviar a foto e a mensagem de boas-vindas
            if (!ctx.message || !ctx.message.caption) {
                console.log('Não tem legenda NO ELSE');
            }
            // Enviar a foto e a mensagem de boas-vindas
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
                        ],
                        [
                            { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                        ]
                    ]
                }
            });
            // Armazene o message_id da última mensagem enviada
            mensagensIDS.push(sentMessage.message_id);
        }
    } catch (error) {
        console.error('Estou no Catch');
    }
}

async function deleteCurrentMessage(ctx) {
    try {
        // Verifique se ctx.callbackQuery.message é definido
        if (!ctx.callbackQuery || !ctx.callbackQuery.message) {
            console.log('ctx.callbackQuery.message não está definido');
            return;
        }

        // Obtenha o chat_id e o message_id do contexto
        const chatId = ctx.callbackQuery.message.chat.id;
        const messageId = ctx.callbackQuery.message.message_id;

        // Exclua a mensagem atual
        await ctx.telegram.deleteMessage(chatId, messageId);
    } catch (error) {
        console.error('Erro ao excluir a mensagem:', error);
    }
}

async function deleteAllMessages(ctx) {
    // Remove todos os elementos undefined de mensagensIDS
    mensagensIDS = mensagensIDS.filter(item => item !== undefined);
    // Verifica se mensagensIDS tem pelo menos uma mensagem
    if (mensagensIDS.length > 0) {
        try {
            // Itera sobre mensagensIDS de trás para frente
            for (let i = mensagensIDS.length - 1; i >= 0; i--) {
                // Exclui a mensagem
                await ctx.telegram.deleteMessage(ctx.chat.id, mensagensIDS[i]);

                // Remove o message_id de mensagensIDS
                mensagensIDS.splice(i, 1);
            }
        } catch (error) {
            console.error('Erro ao excluir todas as mensagens', error);
        }
    } else {
        console.log('Não há mensagens para excluir');
    }
}

module.exports = {
    apresentarTelaInicial,
    MENU_INICIAL,
    deleteCurrentMessage,
    deleteAllMessages,
    mensagensIDS,
};
