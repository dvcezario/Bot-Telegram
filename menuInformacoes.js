// menuInformacoes.js

const { Markup } = require('telegraf');

// Função para enviar o vídeo explicativo
function enviarVideoExplicativo(ctx) {
    // Envie o vídeo explicativo para o usuário (substitua o URL pelo URL do vídeo)
    ctx.replyWithVideo({ source: 'https://example.com/video_explicativo.mp4' });
}

// Função para enviar o texto explicativo
function enviarTextoExplicativo(ctx) {
    // Envie o texto explicativo para o usuário (substitua o texto pelo seu texto explicativo)
    ctx.reply('Aqui está o texto explicativo sobre o jogo...');
}

// Função para enviar informações sobre pagamento
function enviarInformacoesPagamento(ctx) {
    // Envie as informações sobre pagamento para o usuário (substitua o texto pelo seu texto sobre pagamento)
    ctx.reply('Aqui estão as informações sobre pagamento...');
}

// Função para enviar informações sobre recebimento
function enviarInformacoesRecebimento(ctx) {
    // Envie as informações sobre recebimento para o usuário (substitua o texto pelo seu texto sobre recebimento)
    ctx.reply('Aqui estão as informações sobre recebimento...');
}

module.exports = {
//    apresentarInformacoesJogo,
    enviarVideoExplicativo,
    enviarTextoExplicativo,
    enviarInformacoesPagamento,
    enviarInformacoesRecebimento
};
