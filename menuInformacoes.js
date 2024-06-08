const { Markup } = require('telegraf');
const { mensagensIDS } = require('./telaInicial');
const path = require('path');

let isSending = false;

// Função para simular uma barra de carregamento visual com cores
async function carregarBarraProgressoVisual(ctx, message, totalSteps = 10, delay = 300) {
    const fullBlock = '🟩'; // Bloco preenchido (verde)
    const emptyBlock = '⬜'; // Bloco vazio (branco)
    
    for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        const progress = Math.floor((i / totalSteps) * 100);
        const progressBar = `[${fullBlock.repeat(i)}${emptyBlock.repeat(totalSteps - i)}] ${progress}%`;
        await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, null, `Carregando... \n ${progressBar}`);
    }
}

// Função genérica para enviar documentos e vídeos
async function enviarArquivo(ctx, filePath, tipo) {
    if (isSending) return;
    isSending = true;
    const loadingMessage = await ctx.reply('Carregando... \n [⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜] 0%');
    try {
        const delay = tipo === 'video' ? 500 : 300; // Ajusta o tempo de espera com base no tipo de arquivo
        await carregarBarraProgressoVisual(ctx, loadingMessage, 10, delay);
        let salvarId;
        if (tipo === 'video') {
            salvarId = await ctx.replyWithVideo({ source: filePath });
        } else {
            salvarId = await ctx.replyWithDocument({ source: filePath });
        }
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } catch (error) {
        console.error('Erro ao enviar o arquivo:', error);
        await ctx.reply('Desculpe, houve um erro ao enviar o arquivo.');
    } finally {
        isSending = false;
        // Deleta a mensagem de carregamento
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);
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
    mensagensIDS
};
