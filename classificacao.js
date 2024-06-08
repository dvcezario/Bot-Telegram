// classificação.js

const { Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const { apresentarTelaInicial, mensagensIDS } = require('./telaInicial');
const bot = require('./bot');

// Constantes de menu
const MENU_CLASSIFICACAO = 'menu_classificacao';

// Função para apresentar o menu de classificação
function apresentarMenuClassificacao(ctx) {
    const menuState = MENU_CLASSIFICACAO;
    if (ctx.callbackQuery) {
        ctx.editMessageCaption('Selecione o tipo de classificação:', {
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
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
    } else {
        apresentarTelaInicial(ctx);
    }
}

// Função para simular uma barra de carregamento visual com cores
async function carregarBarraProgressoVisual(ctx, message, totalSteps = 10, delay = 400) {
    const fullBlock = '🟩'; // Bloco preenchido (verde)
    const emptyBlock = '⬜'; // Bloco vazio (branco)
    
    for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        const progress = Math.floor((i / totalSteps) * 100);
        const progressBar = `[${fullBlock.repeat(i)}${emptyBlock.repeat(totalSteps - i)}] ${progress}%`;
        await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, null, `Carregando... \n ${progressBar}`);
    }
}

// Ação para carregar a classificação geral
async function apresentarClassificacaoGeral(ctx) {
    const loadingMessage = await ctx.reply('Carregando... \n [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜] 0%');

    try {
        const filePath = path.join(__dirname, 'ClassificacaoGeral.pdf');
        // Simula uma barra de carregamento visual
        await carregarBarraProgressoVisual(ctx, loadingMessage);
        await ctx.replyWithDocument({ source: filePath });
    } catch (error) {
        console.error('Erro ao enviar o PDF:', error);
        await ctx.reply('Desculpe, houve um erro ao enviar o arquivo.');
    } finally {
        // Deleta a mensagem de carregamento
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);
    }
}

// Ação para carregar a classificação da rodada
async function apresentarClassificacaoRodada(ctx) {
    const loadingMessage = await ctx.reply('Carregando... \n [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜] 0%');

    try {
        const filePath = path.join(__dirname, 'ClassificacaoRodada.pdf');
        // Simula uma barra de carregamento visual
        await carregarBarraProgressoVisual(ctx, loadingMessage);
        await ctx.replyWithDocument({ source: filePath });
    } catch (error) {
        console.error('Erro ao enviar o PDF:', error);
        await ctx.reply('Desculpe, houve um erro ao enviar o arquivo.');
    } finally {
        // Deleta a mensagem de carregamento
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);
    }
}

// Exporta as funções necessárias
module.exports = {
    apresentarMenuClassificacao,
    apresentarClassificacaoGeral,
    apresentarClassificacaoRodada
};
