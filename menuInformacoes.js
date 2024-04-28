// menuInformacoes.js

const { Markup } = require('telegraf');
const { mensagensIDS } = require('./telaInicial');
const path = require('path');


let isSending = false;

async function enviarVideoExplicativo(ctx) {
    if (isSending) return;
    isSending = true;
    const videoExplicativoPath = path.join(__dirname, 'VideoExplicativo.mp4');
    try {
        const salvarId = await ctx.replyWithVideo({ source: videoExplicativoPath });
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
}

async function enviarTextoExplicativo(ctx) {
    if (isSending) return;
    isSending = true;
    const textoExplicativoPath = path.join(__dirname, 'TextoExplicativo.docx');
    try {
        const salvarId = await ctx.replyWithDocument({ source: textoExplicativoPath });
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
}

async function enviarInformacoesPagamento(ctx) {
    if (isSending) return;
    isSending = true;
    const pagamentoJogoPath = path.join(__dirname, 'PagamentoJogo.docx');
    try {
        const salvarId =  await ctx.replyWithDocument({ source: pagamentoJogoPath });
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
}

async function enviarInformacoesRecebimento(ctx) {
    if (isSending) return;
    isSending = true;
    const recebimentoPremioPath = path.join(__dirname, 'RecebimentoPremio.docx');
    try {
        const salvarId = await ctx.replyWithDocument({ source: recebimentoPremioPath });
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
}




module.exports = {
    //    apresentarInformacoesJogo,
    enviarVideoExplicativo,
    enviarTextoExplicativo,
    enviarInformacoesPagamento,
    enviarInformacoesRecebimento,
    mensagensIDS
};
