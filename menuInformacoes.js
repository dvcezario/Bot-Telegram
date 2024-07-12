// menuInformacoes.js

const { Markup } = require('telegraf');
const { mensagensIDS } = require('./telaInicial');
const path = require('path');
const fs = require('fs');

let isSending = false;

// Função para simular uma barra de carregamento visual com cores
async function carregarBarraProgressoVisual(ctx, message, totalSteps = 10, delay = 400) {
    const fullBlock = '🟩';
    const emptyBlock = '⬜';
    
    for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        const progress = Math.floor((i / totalSteps) * 100);
        const progressBar = `[${fullBlock.repeat(i)}${emptyBlock.repeat(totalSteps - i)}] ${progress}%`;
        await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, null, `Carregando... \n ${progressBar}`);
    }
}

// Função para calcular o tempo de delay baseado no tempo total de upload
function calcularDelay(tempoTotal, totalSteps = 10) {
    return Math.floor(tempoTotal / totalSteps);
}

// Função genérica para enviar documentos e vídeos
async function enviarArquivo(ctx, filePath, tipo) {
    if (isSending) return;
    isSending = true;

    const loadingMessage = await ctx.reply('Carregando... \n [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜] 0%');
    const originalMarkup = ctx.callbackQuery.message.reply_markup;

    let salvarId;
    try {
        const tempoTotal = tipo === 'video' ? 35000 : 4000; // Tempo total em ms para a barra de progresso
        const delay = calcularDelay(tempoTotal);

        // Bloquear botões durante o carregamento
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

        await carregarBarraProgressoVisual(ctx, loadingMessage, 10, delay);

        if (tipo === 'video') {
            salvarId = await ctx.replyWithVideo({ source: filePath });
        } else {
            salvarId = await ctx.replyWithDocument({ source: filePath });
        }

        ctx.session.mensagensIDS.push(salvarId.message_id);

        // Definir o tempo para apagar a mensagem do arquivo
        const apagarDepois = tipo === 'video' ? 90000 : 6000; // 90 segundos para vídeos, 6 segundos para outros arquivos
        setTimeout(async () => {
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, salvarId.message_id);
            } catch (error) {
                console.error(`Erro ao excluir a mensagem do arquivo ${salvarId.message_id}:`, error);
            }
        }, apagarDepois);
    } catch (error) {
        console.error('Erro ao enviar o arquivo:', error);
        await ctx.reply('Desculpe, houve um erro ao enviar o arquivo.');
    } finally {
        isSending = false;
        // Deleta a mensagem de carregamento
        try {
            await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);
        } catch (error) {
            console.error(`Erro ao excluir a mensagem de carregamento ${loadingMessage.message_id}:`, error);
        }
        // Restaurar os botões após o envio
        await ctx.editMessageReplyMarkup(originalMarkup);
    }
}

async function enviarVideoExplicativo(ctx) {
    const videoExplicativoPath = path.join(__dirname, 'VideoExplicativo.mp4');
    await enviarArquivo(ctx, videoExplicativoPath, 'video');
}

async function enviarTextoExplicativo(ctx) {
    const textoExplicativoPath = path.join(__dirname, 'TextoExplicativo.docx');
    await enviarArquivo(ctx, textoExplicativoPath, 'documento');
}

async function enviarInformacoesPagamento(ctx) {
    const pagamentoJogoPath = path.join(__dirname, 'PagamentoJogo.docx');
    await enviarArquivo(ctx, pagamentoJogoPath, 'documento');
}

async function enviarInformacoesRecebimento(ctx) {
    const recebimentoPremioPath = path.join(__dirname, 'RecebimentoPremio.docx');
    await enviarArquivo(ctx, recebimentoPremioPath, 'documento');
}

module.exports = {
    enviarVideoExplicativo,
    enviarTextoExplicativo,
    enviarInformacoesPagamento,
    enviarInformacoesRecebimento,
};
