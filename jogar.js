// jogar.js

const { Markup } = require('telegraf');
const path = require('path');

// Função para apresentar o submenu "Acerto Acumulado"
function apresentarSubMenuAcertoAcumulado(ctx) {
    menuState = MENU_ACERTO_ACUMULADO;
    if (ctx.callbackQuery) {
        ctx.editMessageCaption('Selecione uma opção para Acerto Acumulado:', {
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

async function apresentarPremiacoes(ctx) {
    const premiacoesPath = path.join(__dirname, 'Premiacoes.pdf');
    ctx.replyWithDocument({ source: premiacoesPath });
}

async function apresentarPlanilhaJogadores(ctx) {
    const planilhaJogadoresPath = path.join(__dirname, 'PlanilhaJogadores.pdf');
    ctx.replyWithDocument({ source: planilhaJogadoresPath });
}


module.exports = {
    apresentarPremiacoes,
    apresentarPlanilhaJogadores
};