// classificacao.js

const { Markup } = require('telegraf');
const path = require('path');
const MENU_CLASSIFICACAO = 'menu_classificacao';
// Importa o array para armazrenar os IDs das mensagens
const { mensagensIDS } = require('./telaInicial');
const deleteCurrentMessage = require('./telaInicial');
const deleteAllMessages = require('./telaInicial');


function apresentarMenuClassificacao(ctx) {
    // código omitido para brevidade
}

async function apresentarClassificacaoGeral(ctx) {
    const classificacaoGeralPath = path.join(__dirname, 'ClassificacaoGeral.pdf');
    const sentMessage2 = await ctx.replyWithDocument({ source: classificacaoGeralPath });
    if (sentMessage2.message_id != undefined) {
        mensagensIDS.push(sentMessage2.message_id);
    }
}

async function apresentarClassificacaoRodada(ctx) {
    const classificacaoRodadaPath = path.join(__dirname, 'ClassificacaoRodada.pdf');
    const sentMessage = await ctx.replyWithDocument({ source: classificacaoRodadaPath });
    mensagensIDS.push(sentMessage.message_id);
}

module.exports = {
    apresentarMenuClassificacao,
    apresentarClassificacaoGeral,
    apresentarClassificacaoRodada,
    MENU_CLASSIFICACAO,
    mensagensIDS,
    deleteCurrentMessage,
    deleteAllMessages,
};
