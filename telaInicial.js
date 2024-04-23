const { Markup } = require('telegraf'); // Importe o Markup do Telegraf
const bot = require('./bot'); // Importe o bot aqui para evitar circularidade

const MENU_INICIAL = 'menu_inicial';

/**
 * Função para apresentar a tela inicial do bot.
 * @param {object} ctx O contexto da mensagem.
 */
async function apresentarTelaInicial(ctx) {
    try {
        const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;
        console.log(from);

        // Verifica se é uma callback query antes de editar a mensagem
        if (ctx.callbackQuery) {
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
                            { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                        ]
                    ]
                }
            });
        }
    } catch (error) {
        console.error('Erro ao enviar a foto e a mensagem:', error);
    }
}

module.exports = {
    apresentarTelaInicial,
    MENU_INICIAL
};
