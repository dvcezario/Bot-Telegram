// menu.js

const { Markup } = require('telegraf');

const { apresentarTelaInicial } = require('./telaInicial');
const { apresentarLinkIndicacao } = require('./linkIndicacao');

const MENU_CLASSIFICACAO = 'menu_classificacao';
const MENU_RESULTADOS = 'menu_resultados';
const MENU_JOGAR = 'menu_jogar';
const MENU_ACERTO_ACUMULADO = 'menu_acerto_acumulado';

function apresentarMenuClassificacao(ctx) {
    menuState = MENU_CLASSIFICACAO;
    if (ctx.callbackQuery) {
        ctx.editMessageCaption('Selecione o tipo de classificação:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '👑 Classificação Geral', callback_data: 'classificacao_geral' },
                        { text: '🎖️ Classificação da Rodada', callback_data: 'classificacao_rodada' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
    } else {
        apresentarTelaInicial(ctx);
    }
}

function apresentarMenuResultados(ctx) {
    menuState = MENU_RESULTADOS;
    if (ctx.callbackQuery) {
        ctx.editMessageCaption('Selecione quais Resultados:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🍀 Todos', callback_data: 'todos_resultados' },
                        { text: '🍀 Concurso', callback_data: 'buscar_concurso' },
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
    } else {
        apresentarTelaInicial(ctx);
    }
}

function apresentarMenuJogar(ctx) {
    menuState = MENU_JOGAR;
    if (ctx.callbackQuery) {
        ctx.editMessageCaption('Selecione uma opção para jogar:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🎱 Acerto Acumulado', callback_data: 'acerto_acumulado' }
                    ],
                    [
                        { text: '🎯 Tiro Certo', callback_data: 'tiro_certo' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
    } else {
        apresentarTelaInicial(ctx);
    }
}

// Função para apresentar as informações do jogo
function apresentarInformacoesJogo(ctx) {
    if (ctx.callbackQuery) {
        ctx.editMessageCaption('Informações sobre Jogo', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📹 Vídeo Explicativo', callback_data: 'video_explicativo' },
                        { text: '📄 Texto Explicativo', callback_data: 'texto_explicativo' }
                    ],
                    [
                        { text: '💳 Pagamento do Jogo', callback_data: 'informacoes_pagamento' },
                        { text: '💰 Recebimento do Prêmio', callback_data: 'informacoes_recebimento' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
    } else {
        apresentarTelaInicial(ctx);
    }
}

// Função para apresentar o menu de indicação
function apresentarMenuLinkIndicacao(ctx) {
    // Chama a função apresentarLinkIndicacao para obter a mensagem e as variáveis
    const { mensagem, contadorIndicacoes, ultimaIndicacao } = apresentarLinkIndicacao(ctx);

    // Edita a mensagem com as informações e as variáveis recebidas
    ctx.editMessageCaption(
        mensagem,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            },
            parse_mode: 'Markdown'
        }
    );
}


// Função para apresentar o menu de ajuda
function apresentarMenuAjuda(ctx) {
    ctx.editMessageCaption('Precisa de ajuda? Estamos aqui para ajudar!', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '💬 Atendimento Humano Telegram', url: 'https://t.me/Decada_da_Sorte' }
                ],
                [
                    { text: '💬 Atendimento Humano WhatsApp', url: 'https://wa.me/5531991142862?text=Ol%C3%A1%2C+quero+participar+do+D%C3%A9cada+da+Sorte%21' }
                ],
                [
                    { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                ]
            ]
        }
    });
}

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
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
    } else {
        apresentarTelaInicial(ctx);
    }
}

module.exports = {
    apresentarMenuClassificacao,
    apresentarMenuResultados,
    apresentarMenuJogar,
    apresentarInformacoesJogo,
    apresentarMenuLinkIndicacao,
    apresentarMenuAjuda,
    apresentarSubMenuAcertoAcumulado,
    MENU_CLASSIFICACAO,
    MENU_RESULTADOS,
    MENU_JOGAR,
};
