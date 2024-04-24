// menuInformacoes.js

const { Markup } = require('telegraf');
const { mensagensIDS } = require('./telaInicial');

// Função para enviar o vídeo explicativo
async function enviarVideoExplicativo(ctx) {
    // Envie o vídeo explicativo para o usuário (substitua o URL pelo URL do vídeo)
    const salvarId = await ctx.replyWithVideo({ source: 'https://example.com/video_explicativo.mp4' });
    if (salvarId) {
        mensagensIDS.push(salvarId.message_id);
    }
    console.log('MensagensIDS', mensagensIDS);

}

// Função para enviar o texto explicativo
async function enviarTextoExplicativo(ctx) {
    // Envie o texto explicativo para o usuário (substitua o texto pelo seu texto explicativo)
    const salvarId = await ctx.reply('Aqui está o texto explicativo sobre o jogo...');
    if (salvarId) {
        mensagensIDS.push(salvarId.message_id);
    }
    console.log('MensagensIDS', mensagensIDS);
}

// Função para enviar informações sobre pagamento
async function enviarInformacoesPagamento(ctx) {
    // Envie as informações sobre pagamento para o usuário (substitua o texto pelo seu texto sobre pagamento)
    const salvarId = await ctx.reply('Aqui estão as informações sobre pagamento...');
    if (salvarId) {
        mensagensIDS.push(salvarId.message_id);
    }
    console.log('MensagensIDS', mensagensIDS)
}

// Função para enviar informações sobre recebimento
async function enviarInformacoesRecebimento(ctx) {
    // Envie as informações sobre recebimento para o usuário (substitua o texto pelo seu texto sobre recebimento)
    const salvarId = await ctx.reply('Aqui estão as informações sobre recebimento...');
    if (salvarId) {
        mensagensIDS.push(salvarId.message_id);
    }
    console.log('MensagensIDS', mensagensIDS)
}

module.exports = {
//    apresentarInformacoesJogo,
    enviarVideoExplicativo,
    enviarTextoExplicativo,
    enviarInformacoesPagamento,
    enviarInformacoesRecebimento,
    mensagensIDS
};
