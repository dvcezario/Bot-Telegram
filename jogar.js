// jogar.js

const { Markup } = require('telegraf');
const path = require('path');
const { mensagensIDS, deleteAllMessages } = require('./telaInicial');

// Função para apresentar o submenu "Acerto Acumulado"
async function apresentarSubMenuAcertoAcumulado(ctx) {
    menuState = MENU_ACERTO_ACUMULADO;
    if (ctx.callbackQuery) {
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
        await ctx.editMessageCaption('Selecione uma opção para Acerto Acumulado:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🏁 Participar do Jogo', callback_data: 'participar_jogo' }
                    ],
                    [
                        { text: '🏆 Premiações', callback_data: 'premiacoes' }
                    ],
                    [
                        { text: '🧍‍♂️🧍‍♀️🧍 Planilha de Jogadores', callback_data: 'planilha_jogadores' }
                    ],
                    [
                        { text: '🔙 Voltar', callback_data: 'voltar' }
                    ]
                ]
            }
        });
    } else {
        apresentarTelaInicial(ctx);
    }
}

let isSending = false;

async function apresentarPremiacoes(ctx) {
    if (isSending) return;
    isSending = true;
    try {
        const premiacoesPath = path.join(__dirname, 'Premiacoes.pdf');
        const salvarId = await ctx.replyWithDocument({ source: premiacoesPath });
        if (salvarId) {
            mensagensIDS.push(salvarId.message_id);
        }
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
}

async function apresentarPlanilhaJogadores(ctx) {
    if (isSending) return;
    isSending = true;
    try {
        const planilhaJogadoresPath = path.join(__dirname, 'PlanilhaJogadores.pdf');
        const salvarId = await ctx.replyWithDocument({ source: planilhaJogadoresPath });
        if (salvarId) {
            mensagensIDS.push(salvarId.message_id);
        }
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        isSending = false;
    }
}


module.exports = {
    apresentarPremiacoes,
    apresentarPlanilhaJogadores,
    mensagensIDS
};