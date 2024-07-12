// telaInicial.js

const { Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const { obterProximaRodadaData } = require('./config');

const photoPath = path.join(__dirname, 'Logo3.jpg');

async function apresentarTelaInicial(ctx) {
    try {
        if (!ctx.session.mensagensIDS) {
            ctx.session.mensagensIDS = [];
        }

        const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;
        const caption = `${from.first_name || ''} ${from.last_name || ''}, Seja Bem-Vindo ao Década da Sorte! ${obterProximaRodadaData()}`;

        const sentMessage = await ctx.replyWithPhoto({ source: photoPath }, {
            caption: caption,
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
                        { text: '❖ Cadastrar Pix', callback_data: 'menu_cadastrar_pix' }
                    ]
                ]
            }
        });

        ctx.session.mensagensIDS.push(sentMessage.message_id);
    } catch (error) {
        console.error('Erro ao apresentar a tela inicial:', error);
    }
}

async function deleteAllMessages(ctx) {
    if (Array.isArray(ctx.session.mensagensIDS)) {
        for (const messageId of ctx.session.mensagensIDS) {
            try {
                await ctx.deleteMessage(messageId);
            } catch (error) {
                if (error.code !== 400 && error.code !== 404) {
                    console.error('Erro ao excluir mensagem:', error);
                }
            }
        }
        ctx.session.mensagensIDS = [];
    }
}

module.exports = {
    apresentarTelaInicial,
    deleteAllMessages
};
