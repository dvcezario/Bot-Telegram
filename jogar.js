// jogar.js

const { Markup } = require('telegraf');
const path = require('path');
const { mensagensIDS } = require('./telaInicial');

// Função para apresentar o submenu "Acerto Acumulado"
async function apresentarSubMenuAcertoAcumulado(ctx) {
    menuState = MENU_ACERTO_ACUMULADO;
    if (ctx.callbackQuery) {
        const salvarId = await ctx.editMessageCaption('Selecione uma opção para Acerto Acumulado:', {
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
        mensagensIDS.push(salvarId.message_id);
    } else {
        apresentarTelaInicial(ctx);
    }
}

async function apresentarPremiacoes(ctx) {
    const premiacoesPath = path.join(__dirname, 'Premiacoes.pdf');
    const salvarId = await ctx.replyWithDocument({ source: premiacoesPath });
    if (salvarId) {
        mensagensIDS.push(salvarId.message_id);
    }
    mensagensIDS.push(salvarId.message_id);
}

async function apresentarPlanilhaJogadores(ctx) {
    const planilhaJogadoresPath = path.join(__dirname, 'PlanilhaJogadores.pdf');
    const salvarId = await ctx.replyWithDocument({ source: planilhaJogadoresPath });
    if (salvarId) {
        mensagensIDS.push(salvarId.message_id);
    }
    mensagensIDS.push(salvarId.message_id);
}


module.exports = {
    apresentarPremiacoes,
    apresentarPlanilhaJogadores,
    mensagensIDS
};