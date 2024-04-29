// classificacao.js

const { Markup } = require('telegraf');
const path = require('path');
const MENU_CLASSIFICACAO = 'menu_classificacao';
const Telegraf = require('telegraf').Telegraf;
const session = require('telegraf').session;
const bot = new Telegraf(process.env.BOT_TOKEN);

// Importa o array para armazrenar os IDs das mensagens
const { mensagensIDS } = require('./telaInicial');
const deleteCurrentMessage = require('./telaInicial');
const deleteAllMessages = require('./telaInicial');

// Enable session middleware
bot.use(session());

function apresentarMenuClassificacao(ctx) {
    // código omitido para brevidade
}


let isSending = false;

async function apresentarClassificacaoGeral(ctx) {
    if (isSending) return;
    isSending = true;
    try {
        const classificacaoGeralPath = path.join(__dirname, 'ClassificacaoGeral.pdf');
        const sentMessage2 = await ctx.replyWithDocument({ source: classificacaoGeralPath });
        ctx.session.mensagensIDS.push(sentMessage2.message_id);
    } finally {
        isSending = false;
    }
}

async function apresentarClassificacaoRodada(ctx) {
    if (isSending) return;
    isSending = true;
    try {
        const classificacaoRodadaPath = path.join(__dirname, 'ClassificacaoRodada.pdf');
        const sentMessage = await ctx.replyWithDocument({ source: classificacaoRodadaPath });
        ctx.session.mensagensIDS.push(sentMessage.message_id);
    } finally {
        isSending = false;
    }
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
