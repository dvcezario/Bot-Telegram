// Importa os módulos necessários
const { Markup } = require('telegraf');
const path = require('path');
const { mensagensIDS, deleteAllMessages } = require('./telaInicial');

// Função para apresentar o submenu "Acerto Acumulado6"
async function apresentarSubMenuAcertoAcumulado6(ctx) {
    menuState = MENU_ACERTO_ACUMULADO6;
    if (ctx.callbackQuery) {
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
        await ctx.editMessageCaption('Selecione uma opção para Acerto Acumulado 6:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🏁 Participar do Jogo', callback_data: 'participar_jogo_acumulado6' }
                    ],
                    [
                        { text: '🏆 Premiações', callback_data: 'premiacoes_acumulado6' }
                    ],
                    [
                        { text: '🧍‍♂️🧍‍♀️🧍 Planilha de Jogadores', callback_data: 'planilha_jogadores_acumulado6' }
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

// Função para apresentar o submenu "Acerto Acumulado10"
async function apresentarSubMenuAcertoAcumulado10(ctx) {
    menuState = MENU_ACERTO_ACUMULADO10;
    if (ctx.callbackQuery) {
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
        await ctx.editMessageCaption('Selecione uma opção para Acerto Acumulado 10:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🏁 Participar do Jogo', callback_data: 'participar_jogo_acumulado10' }
                    ],
                    [
                        { text: '🏆 Premiações', callback_data: 'premiacoes_acumulado10' }
                    ],
                    [
                        { text: '🧍‍♂️🧍‍♀️🧍 Planilha de Jogadores', callback_data: 'planilha_jogadores_acumulado10' }
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

// Função para apresentar o submenu "Tiro Certo"
async function apresentarSubMenuTiroCerto(ctx) {
    menuState = MENU_TIRO_CERTO;
    if (ctx.callbackQuery) {
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
        await ctx.editMessageCaption('Selecione uma opção para o jogo Tiro Certo:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🏁 Participar do Jogo', callback_data: 'participar_jogo_tiro_certo' }
                    ],
                    [
                        { text: '🏆 Premiações', callback_data: 'premiacoes_tiro_certo' }
                    ],
                    [
                        { text: '🧍‍♂️🧍‍♀️🧍 Planilha de Jogadores', callback_data: 'planilha_jogadores_tiro_certo' }
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

// Função para apresentar as premiações
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

// Função para apresentar a planilha de jogadores
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

// Exporta as funções para serem usadas em outros módulos
module.exports = {
    apresentarSubMenuAcertoAcumulado6,
    apresentarSubMenuAcertoAcumulado10,
    apresentarSubMenuTiroCerto,
    apresentarPremiacoes,
    apresentarPlanilhaJogadores,
    mensagensIDS
};
