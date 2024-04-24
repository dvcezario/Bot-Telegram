// menuInformacoes.js

const { Markup } = require('telegraf');
const { mensagensIDS } = require('./telaInicial');
const path = require('path');

// Função para enviar o vídeo explicativo
async function enviarVideoExplicativo(ctx) {
    // Envie o vídeo explicativo para o usuário (substitua o URL pelo URL do vídeo)
    const videoExplicativoPath = path.join(__dirname, 'VideoExplicativo.mp4');
    const salvarId = await ctx.replyWithVideo({ source: videoExplicativoPath });
    if (salvarId) {
        mensagensIDS.push(salvarId.message_id);
    }
    console.log('MensagensIDS', mensagensIDS);

}

// Função para enviar o texto explicativo
async function enviarTextoExplicativo(ctx) {
    // Envie o texto explicativo para o usuário (substitua o texto pelo seu texto explicativo)
    const textoExplicativoPath = path.join(__dirname, 'TextoExplicativo.docx');
    const salvarId = await ctx.replyWithDocument({ source: textoExplicativoPath });
    if (salvarId) {
        mensagensIDS.push(salvarId.message_id);
    }
    console.log('MensagensIDS', mensagensIDS);
}

// Função para enviar informações sobre pagamento
async function enviarInformacoesPagamento(ctx) {
    // Envie as informações sobre pagamento para o usuário (substitua o texto pelo seu texto sobre pagamento)
    const pagamentoJogoPath = path.join(__dirname, 'PagamentoJogo.docx');
    const salvarId = await ctx.replyWithDocument({ source: pagamentoJogoPath });
    if (salvarId) {
        mensagensIDS.push(salvarId.message_id);
    }
    console.log('MensagensIDS', mensagensIDS)
}

// Função para enviar informações sobre recebimento
async function enviarInformacoesRecebimento(ctx) {
    // Envie as informações sobre recebimento para o usuário (substitua o texto pelo seu texto sobre recebimento)
    const recebimentoPremioPath = path.join(__dirname, 'RecebimentoPremio.docx');
    const salvarId = await ctx.replyWithDocument({ source: recebimentoPremioPath });
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
