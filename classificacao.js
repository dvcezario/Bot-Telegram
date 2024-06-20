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
async function carregarBarraProgressoVisual(ctx, message, totalSteps = 10, delay = 1000) {
    const fullBlock = '🟩'; // Bloco preenchido (verde)
    const emptyBlock = '⬜'; // Bloco vazio (branco)
    
    for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        const progress = Math.floor((i / totalSteps) * 100);
        const progressBar = `[${fullBlock.repeat(i)}${emptyBlock.repeat(totalSteps - i)}] ${progress}%`;
        await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, null, `Carregando... \n ${progressBar}`);
    }
}

// Função para calcular o delay com base no tempo de upload desejado (entre 4 e 10 segundos)
function calcularDelay(tempoTotalEmSegundos, totalSteps = 10) {
    return Math.floor((tempoTotalEmSegundos * 1000) / totalSteps);
}

// Função genérica para carregar e enviar um PDF de classificação
async function apresentarClassificacao(ctx, tipo) {
    const loadingMessage = await ctx.reply('Carregando... \n [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜] 0%');
    let fileMessageId;

    try {
        const tempoTotalEmSegundos = Math.random() * (10 - 4) + 4; // Tempo de upload entre 4 e 10 segundos
        const delay = calcularDelay(tempoTotalEmSegundos);

        const filePath = path.join(__dirname, `${tipo}.pdf`);
        
        // Bloquear botões durante o carregamento
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

        await carregarBarraProgressoVisual(ctx, loadingMessage, 10, delay);

        const fileMessage = await ctx.replyWithDocument({ source: filePath });
        fileMessageId = fileMessage.message_id;

        // Restaurar os botões após o carregamento
        await ctx.editMessageReplyMarkup({
            inline_keyboard: [
                [
                    { text: '👑 Classificação Geral', callback_data: 'classificacao_geral' },
                    { text: '🎖️ Classificação da Rodada', callback_data: 'classificacao_rodada' }
                ],
                [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
            ]
        });

        // Agendar a exclusão da mensagem do arquivo após 6 segundos
        setTimeout(async () => {
            try {
                await ctx.deleteMessage(fileMessageId);
            } catch (error) {
                console.error(`Erro ao excluir a mensagem do arquivo ${fileMessageId}:`, error);
            }
        }, 6000); // 6 segundos

    } catch (error) {
        console.error(`Erro ao enviar o PDF de ${tipo}:`, error);
        await ctx.reply('Desculpe, houve um erro ao enviar o arquivo.');
    } finally {
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);
    }
}

// Ação para carregar a classificação geral
async function apresentarClassificacaoGeral(ctx) {
    await apresentarClassificacao(ctx, 'ClassificacaoGeral');
}

// Ação para carregar a classificação da rodada
async function apresentarClassificacaoRodada(ctx) {
    await apresentarClassificacao(ctx, 'ClassificacaoRodada');
}

// Exporta as funções necessárias
module.exports = {
    apresentarMenuClassificacao,
    apresentarClassificacaoGeral,
    apresentarClassificacaoRodada
};
