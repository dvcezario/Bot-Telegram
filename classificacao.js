// classificacao.js

const { Markup } = require('telegraf');
const path = require('path');

const MENU_CLASSIFICACAO = 'menu_classificacao';

function apresentarMenuClassificacao(ctx) {
    // código omitido para brevidade
}

async function apresentarClassificacaoGeral(ctx) {
    const classificacaoGeralPath = path.join(__dirname, 'ClassificacaoGeral.pdf');
    ctx.replyWithDocument({ source: classificacaoGeralPath });
}

async function apresentarClassificacaoRodada(ctx) {
    const classificacaoRodadaPath = path.join(__dirname, 'ClassificacaoRodada.pdf');
    ctx.replyWithDocument({ source: classificacaoRodadaPath });
}

module.exports = {
    apresentarMenuClassificacao,
    apresentarClassificacaoGeral,
    apresentarClassificacaoRodada,
    MENU_CLASSIFICACAO
};
