const { Markup } = require('telegraf');
const { apresentarTelaInicial, deleteAllMessages } = require('./telaInicial');
const { apresentarLinkIndicacao } = require('./linkIndicacao');
const { proximaRodadaData } = require('./config');

const MENU_CLASSIFICACAO = 'menu_classificacao';
const MENU_RESULTADOS = 'menu_resultados';
const MENU_JOGAR = 'menu_jogar';
const MENU_ACERTO_ACUMULADO6 = 'menu_acerto_acumulado6';
const MENU_ACERTO_ACUMULADO10 = 'menu_acerto_acumulado10';
const MENU_TIRO_CERTO = 'menu_tiro_certo';
const MENU_CADASTRAR_PIX = 'menu_cadastrar_pix';

async function apresentarMenuClassificacao(ctx) {
    if (ctx.callbackQuery) {
        await ctx.editMessageCaption('Selecione o tipo de classificação:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '👑 Classificação Geral', callback_data: 'classificacao_geral' }],
                    [{ text: '🎖️ Classificação da Rodada', callback_data: 'classificacao_rodada' }],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
    } else {
        apresentarTelaInicial(ctx);
    }
}

async function apresentarMenuResultados(ctx) {
    if (ctx.callbackQuery) {
        await ctx.editMessageCaption('Selecione quais Resultados:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🍀 Todos', callback_data: 'todos_resultados' },
                        { text: '🍀 Concurso', callback_data: 'buscar_concurso' }
                    ],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
    } else {
        apresentarTelaInicial(ctx);
    }
}

async function apresentarMenuJogar(ctx) {
    if (ctx.callbackQuery) {
        await ctx.editMessageCaption('Selecione uma opção para jogar:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🎱 Acumulado - 10 Números 6 Acertos', callback_data: 'acerto_acumulado6' }],
                    [{ text: '🎱 Acumulado - 10 Números 10 Acertos', callback_data: 'acerto_acumulado10' }],
                    [{ text: '🎯 Tiro Certo - Maior Pontuador', callback_data: 'tiro_certo' }],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
    } else {
        apresentarTelaInicial(ctx);
    }
}

let isSending = false;

async function apresentarInformacoesJogo(ctx) {
    if (isSending) return;
    isSending = true;
    try {
        if (ctx.callbackQuery) {
            await ctx.editMessageCaption('Informações sobre Jogo', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📹 Vídeo Explicativo', callback_data: 'video_explicativo' }],
                        [{ text: '📄 Texto Explicativo', callback_data: 'texto_explicativo' }],
                        [{ text: '💳 Pagamento do Jogo', callback_data: 'informacoes_pagamento' }],
                        [{ text: '💰 Recebimento do Prêmio', callback_data: 'informacoes_recebimento' }],
                        [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                    ]
                }
            });
            ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
        } else {
            apresentarTelaInicial(ctx);
        }
    } catch (err) {
        if (err.response && err.response.error_code !== 400) {
            throw err;
        }
    } finally {
        isSending = false;
    }
}

async function apresentarMenuLinkIndicacao(ctx) {
    const { mensagem } = apresentarLinkIndicacao(ctx);

    await ctx.editMessageCaption(
        mensagem,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            },
            parse_mode: 'Markdown'
        }
    );
    ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
}

async function apresentarMenuAjuda(ctx) {
    if (isSending) return;
    isSending = true;
    try {
        await ctx.editMessageCaption('Precisa de ajuda? Estamos aqui para ajudar!', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💬 Atendimento Humano Telegram', url: 'https://t.me/Decada_da_Sorte' }],
                    [{ text: '💬 Atendimento Humano WhatsApp', url: 'https://wa.me/5531995384968?text=Ol%C3%A1%2C+quero+participar+do+D%C3%A9cada+da+Sorte%21' }],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
    } catch (err) {
        if (err.response && err.response.error_code !== 400) {
            throw err;
        }
    } finally {
        isSending = false;
    }
}

async function apresentarMenuCadastrarPix(ctx) {
    if (ctx.callbackQuery) {
        await ctx.editMessageCaption('Cadastre sua chave Pix:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🔢 CPF/CNPJ', callback_data: 'cadastrar_pix_cpf_cnpj' },
                        { text: '✉️ E-mail', callback_data: 'cadastrar_pix_email' }
                    ],
                    [
                        { text: '📱 Celular', callback_data: 'cadastrar_pix_celular' },
                        { text: '🔑 Chave Aleatória', callback_data: 'cadastrar_pix_aleatoria' }
                    ],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
    } else {
        apresentarTelaInicial(ctx);
    }
}

async function deleteSubmenuMessages(ctx) {
    const submenuMessageId = ctx.callbackQuery.message.message_id;
    try {
        await ctx.deleteMessage(submenuMessageId);
        ctx.session.mensagensIDS = ctx.session.mensagensIDS.filter(id => id !== submenuMessageId);
    } catch (error) {
        console.error('Erro ao excluir mensagem do submenu:', error);
    }
}

async function apresentarSubMenuAcertoAcumulado6(ctx) {
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageCaption('Selecione uma opção para Acerto Acumulado 6:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🏁 Participar do Jogo', callback_data: 'participar_jogo_acumulado6' }],
                        [{ text: '🏆 Premiações', callback_data: 'premiacoes_acumulado6' }],
                        [{ text: '🧍‍♂️🧍‍♀️🧍 Planilha de Jogadores', callback_data: 'planilha_jogadores_acumulado6' }],
                        [{ text: '🎮 Menu Anterior', callback_data: 'menu_jogar' }],
                        [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                    ]
                }
            });
            ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
        } catch (err) {
            if (err.response && err.response.error_code !== 400) {
                throw err;
            }
        }
    }
}

async function apresentarSubMenuAcertoAcumulado10(ctx) {
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageCaption('Selecione uma opção para Acerto Acumulado 10:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🏁 Participar do Jogo', callback_data: 'participar_jogo_acumulado10' }],
                        [{ text: '🏆 Premiações', callback_data: 'premiacoes_acumulado10' }],
                        [{ text: '🧍‍♂️🧍‍♀️🧍 Planilha de Jogadores', callback_data: 'planilha_jogadores_acumulado10' }],
                        [{ text: '🎮 Menu Anterior', callback_data: 'menu_jogar' }],
                        [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                    ]
                }
            });
            ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
        } catch (err) {
            if (err.response && err.response.error_code !== 400) {
                throw err;
            }
        }
    }
}

async function apresentarSubMenuTiroCerto(ctx) {
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageCaption('Selecione uma opção para Tiro Certo:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🏁 Participar do Jogo', callback_data: 'participar_jogo_tiro_certo' }],
                        [{ text: '🏆 Premiações', callback_data: 'premiacoes_tiro_certo' }],
                        [{ text: '🧍‍♂️🧍‍♀️🧍 Planilha de Jogadores', callback_data: 'planilha_jogadores_tiro_certo' }],
                        [{ text: '🎮 Menu Anterior', callback_data: 'menu_jogar' }],
                        [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                    ]
                }
            });
            ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
        } catch (err) {
            if (err.response && err.response.error_code !== 400) {
                throw err;
            }
        }
    }
}

module.exports = {
    apresentarMenuClassificacao,
    apresentarMenuResultados,
    apresentarMenuJogar,
    apresentarInformacoesJogo,
    apresentarMenuLinkIndicacao,
    apresentarMenuAjuda,
    apresentarMenuCadastrarPix,
    apresentarSubMenuAcertoAcumulado6,
    apresentarSubMenuAcertoAcumulado10,
    apresentarSubMenuTiroCerto,
    deleteSubmenuMessages,
};
