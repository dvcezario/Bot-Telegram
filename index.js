require('dotenv').config({ path: __dirname + '/.env' });
const { Telegraf, Markup, session } = require('telegraf');
const bot = new Telegraf(process.env.token);
const { proximaRodadaData } = require('./config');

const { deleteAllMessages } = require('./telaInicial');
const fs = require('fs');
const resultados = require('./resultados');
const cadastrarPix = require('./cadastrarPix');
const jogoAcumulado6 = require('./jogoAcumulado6');
const jogoAcumulado10 = require('./jogoAcumulado10');
const jogoTiroCerto = require('./jogoTiroCerto');
const path = require('path');
const photoPath = path.join(__dirname, 'Logo3.jpg');

const { apresentarTelaInicial, MENU_INICIAL } = require('./telaInicial');
const { 
    apresentarMenuClassificacao, 
    apresentarMenuResultados, 
    apresentarMenuJogar, 
    apresentarInformacoesJogo, 
    apresentarMenuLinkIndicacao, 
    apresentarMenuAjuda, 
    apresentarMenuCadastrarPix, 
    apresentarSubMenuAcertoAcumulado, 
    apresentarSubMenuAcertoAcumulado6, 
    apresentarSubMenuAcertoAcumulado10, 
    apresentarSubMenuTiroCerto 
} = require('./menu');
const { 
    apresentarTodosResultados, 
    apresentarResultadoAnterior, 
    apresentarResultadoProximo, 
    escutarNumeroConcurso 
} = require('./resultados');
const { 
    apresentarClassificacaoGeral, 
    apresentarClassificacaoRodada 
} = require('./classificacao');
const { 
    apresentarPremiacoes, 
    apresentarPlanilhaJogadores 
} = require('./jogar');
const { 
    enviarLembreteSorteio,
    enviarLembreteInicioRodada,
    enviarMensagemPagamentoPendente,
    enviarMensagemConfirmacaoPagamento 
} = require('./mensagensAssincronas');
const { 
    validatePhoneNumberAcumulado6, 
    handleJogoAcumulado6Text 
} = require('./jogoAcumulado6');
const { 
    validatePhoneNumberAcumulado10 
} = require('./jogoAcumulado10');
const { 
    validatePhoneNumberTiroCerto 
} = require('./jogoTiroCerto');
const { 
    enviarVideoExplicativo, 
    enviarTextoExplicativo, 
    enviarInformacoesPagamento, 
    enviarInformacoesRecebimento 
} = require('./menuInformacoes');
const { 
    cadastrarPixCPF_CNPJ, 
    cadastrarPixEmail, 
    cadastrarPixCelular, 
    cadastrarPixChaveAleatoria 
} = require('./cadastrarPix');
const mercadopago = require('./mercadopago');
const { mensagensIDS } = require('./telaInicial');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Middleware de sessão
bot.use(session());

// Middleware para inicializar ctx.session
bot.use((ctx, next) => {
    if (!ctx.session) {
        ctx.session = {};
    }
    if (!ctx.session.mensagensIDS) {
        ctx.session.mensagensIDS = [];
    }
    return next();
});

// Comando /start
bot.start(async (ctx) => {
    await ctx.deleteMessage(ctx.message.message_id); // Apagar o comando digitado pelo usuário
    if (ctx.session.mensagensIDS.length > 0) {
        await deleteAllMessages(ctx);
    }
    apresentarTelaInicial(ctx);
});

// Ações
bot.action('menu_classificacao', apresentarMenuClassificacao);
bot.action('menu_resultados', apresentarMenuResultados);
bot.action('menu_jogar', apresentarMenuJogar);
bot.action('classificacao_geral', apresentarClassificacaoGeral);
bot.action('classificacao_rodada', apresentarClassificacaoRodada);
bot.action('resultado_anterior', apresentarResultadoAnterior);
bot.action('resultado_proximo', apresentarResultadoProximo);

bot.action('voltar', async (ctx) => {
    await deleteAllMessages(ctx); // Apagar todas as mensagens anteriores
    apresentarTelaInicial(ctx); // Mostrar o menu inicial
});

bot.action('premiacoes_acumulado6', async (ctx) => {
    await apresentarPremiacoes(ctx, 'Acumulado6');
});

bot.action('premiacoes_acumulado10', async (ctx) => {
    await apresentarPremiacoes(ctx, 'Acumulado10');
});

bot.action('premiacoes_tiro_certo', async (ctx) => {
    await apresentarPremiacoes(ctx, 'TiroCerto');
});

bot.action('planilha_jogadores_acumulado6', async (ctx) => {
    await apresentarPlanilhaJogadores(ctx, 'Acumulado6');
});

bot.action('planilha_jogadores_acumulado10', async (ctx) => {
    await apresentarPlanilhaJogadores(ctx, 'Acumulado10');
});

bot.action('planilha_jogadores_tiro_certo', async (ctx) => {
    await apresentarPlanilhaJogadores(ctx, 'TiroCerto');
});

bot.action('todos_resultados', apresentarTodosResultados);
bot.action('acerto_acumulado6', apresentarSubMenuAcertoAcumulado6);

// Comentando as ações para funcionalidades não implementadas
// bot.action('acerto_acumulado10', apresentarSubMenuAcertoAcumulado10);
// bot.action('tiro_certo', apresentarSubMenuTiroCerto);
// bot.action('link_indicacao', apresentarMenuLinkIndicacao);

bot.action('ajuda', apresentarMenuAjuda);
bot.action('menu_informacoes', apresentarInformacoesJogo);
bot.action('video_explicativo', enviarVideoExplicativo);
bot.action('texto_explicativo', enviarTextoExplicativo);
bot.action('informacoes_pagamento', enviarInformacoesPagamento);
bot.action('informacoes_recebimento', enviarInformacoesRecebimento);

// Mensagens para funcionalidades em desenvolvimento
const mensagemEmDesenvolvimento = async (ctx, funcionalidade) => {
    await deleteAllMessages(ctx); // Apagar todas as mensagens anteriores
    const from = ctx.callbackQuery ? ctx.callbackQuery.from : ctx.message.from;
    const mensagem = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
        caption: `Desculpe pelo transtorno, ${from.first_name} ${from.last_name}. A funcionalidade ${funcionalidade} ainda está em desenvolvimento e logo estará disponível.`,
        reply_markup: {
            inline_keyboard: [
                [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
            ]
        }
    });
    ctx.session.mensagensIDS.push(mensagem.message_id); // Adicionar a mensagem à sessão para exclusão futura
};

bot.action('acerto_acumulado10', (ctx) => mensagemEmDesenvolvimento(ctx, 'Acumulado - 10 Números 10 Acertos'));
bot.action('tiro_certo', (ctx) => mensagemEmDesenvolvimento(ctx, 'Tiro Certo'));
bot.action('link_indicacao', (ctx) => mensagemEmDesenvolvimento(ctx, 'Link de Indicação'));

// Comandos
bot.command('classificacao', async (ctx) => {
    await ctx.deleteMessage(ctx.message.message_id); // Apagar o comando digitado pelo usuário
    if (ctx.session.isSending) return;
    ctx.session.isSending = true;
    try {
        if (ctx.session.mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.mensagensIDS[0]);
            ctx.session.mensagensIDS.shift();
        }
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Selecione o tipo de classificação:',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '👑 Classificação Geral', callback_data: 'classificacao_geral' }
                    ],
                    [
                        { text: '🎖️ Classificação da Rodada', callback_data: 'classificacao_rodada' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        ctx.session.isSending = false;
    }
});

bot.command('jogar', async (ctx) => {
    await ctx.deleteMessage(ctx.message.message_id); // Apagar o comando digitado pelo usuário
    if (ctx.session.isSending) return;
    ctx.session.isSending = true;
    try {
        if (ctx.session.mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.mensagensIDS[0]);
            ctx.session.mensagensIDS.shift();
        }
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Selecione uma opção para jogar:',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🎱 Acumulado - 10 Números 6 Acertos', callback_data: 'acerto_acumulado6' }
                    ],
                    [
                        { text: '🎱 Acumulado - 10 Números 10 Acertos', callback_data: 'acerto_acumulado10' }
                    ],
                    [
                        { text: '🎯 Tiro Certo - Maior Pontuador', callback_data: 'tiro_certo' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        ctx.session.isSending = false;
    }
});

bot.command('indicacao', async (ctx) => {
    await ctx.deleteMessage(ctx.message.message_id); // Apagar o comando digitado pelo usuário
    if (ctx.session.isSending) return;
    ctx.session.isSending = true;
    try {
        if (ctx.session.mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.mensagensIDS[0]);
            ctx.session.mensagensIDS.shift();
        }
        const photo = fs.readFileSync(photoPath);
        const contadorIndicacoes = 0;
        const ultimaIndicacao = 'N/A';
        const linkBotTelegram = 'https://t.me/your_bot';

        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: `
            💰 Ganhe bônus de 15% da aposta do seu indicado.\n\n📈 Indicações: ${contadorIndicacoes}\n🏷 Última indicação: ${ultimaIndicacao}\n\n🔗 Link\n${linkBotTelegram}
            `,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        ctx.session.isSending = false;
    }
});

bot.command('ajuda', async (ctx) => {
    await ctx.deleteMessage(ctx.message.message_id); // Apagar o comando digitado pelo usuário
    if (ctx.session.isSending) return;
    ctx.session.isSending = true;
    try {
        if (ctx.session.mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.mensagensIDS[0]);
            ctx.session.mensagensIDS.shift();
        }
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Precisa de ajuda? Estamos aqui para ajudar!',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💬 Atendimento Humano Telegram', url: 'https://t.me/Decada_da_Sorte' }
                    ],
                    [
                        { text: '💬 Atendimento Humano WhatsApp', url: 'https://wa.me/5531995384968?text=Ol%C3%A1%2C+quero+participar+do+D%C3%A9cada+da+Sorte%21' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        ctx.session.isSending = false;
    }
});

bot.command('informacoes', async (ctx) => {
    await ctx.deleteMessage(ctx.message.message_id); // Apagar o comando digitado pelo usuário
    if (ctx.session.isSending) return;
    ctx.session.isSending = true;
    try {
        if (ctx.session.mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.mensagensIDS[0]);
            ctx.session.mensagensIDS.shift();
        }
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Informações sobre Jogo',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📹 Vídeo Explicativo', callback_data: 'video_explicativo' }
                    ],
                    [
                        { text: '📄 Texto Explicativo', callback_data: 'texto_explicativo' }
                    ],
                    [
                        { text: '💳 Pagamento do Jogo', callback_data: 'informacoes_pagamento' }
                    ],
                    [
                        { text: '💰 Recebimento do Prêmio', callback_data: 'informacoes_recebimento' }
                    ],
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        ctx.session.isSending = false;
    }
});

bot.command('pix', async (ctx) => {
    await ctx.deleteMessage(ctx.message.message_id); // Apagar o comando digitado pelo usuário
    if (ctx.session.isSending) return;
    ctx.session.isSending = true;
    try {
        if (ctx.session.mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.mensagensIDS[0]);
            ctx.session.mensagensIDS.shift();
        }
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Cadastre sua chave Pix:',
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
                    [
                        { text: '🏠 Menu Inicial', callback_data: 'voltar' }
                    ]
                ]
            }
        });
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        ctx.session.isSending = false;
    }
});

bot.command('resultados', async (ctx) => {
    await ctx.deleteMessage(ctx.message.message_id); // Apagar o comando digitado pelo usuário
    if (ctx.session.isSending) return;
    ctx.session.isSending = true;
    try {
        if (ctx.session.mensagensIDS.length > 0) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.mensagensIDS[0]);
            ctx.session.mensagensIDS.shift();
        }
        const photo = fs.readFileSync(photoPath);
        const salvarId = await ctx.replyWithPhoto({ source: photo }, {
            caption: 'Selecione quais Resultados:',
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
        ctx.session.mensagensIDS.push(salvarId.message_id);
    } finally {
        ctx.session.isSending = false;
    }
});

bot.action('buscar_concurso', async (ctx) => {
    let message;
    if (ctx.callbackQuery.message.text) {
        message = await ctx.editMessageText('Por favor, digite o número do concurso:');
    } else if (ctx.callbackQuery.message.photo) {
        message = await ctx.editMessageCaption('Por favor, digite o número do concurso:');
    }
    if (message) {
        ctx.session.mensagensIDS.push(message.message_id);
    }
    ctx.session.awaitingNumeroConcurso = true;
});

bot.action('menu_cadastrar_pix', apresentarMenuCadastrarPix);
bot.action('cadastrar_pix_cpf_cnpj', cadastrarPixCPF_CNPJ);
bot.action('cadastrar_pix_email', cadastrarPixEmail);
bot.action('cadastrar_pix_celular', cadastrarPixCelular);
bot.action('cadastrar_pix_aleatoria', cadastrarPixChaveAleatoria);

// Função para enviar mensagem de erro com logo
const enviarMensagemErroComLogo = async (ctx, mensagemErro) => {
    await deleteAllMessages(ctx); // Apagar todas as mensagens anteriores
    await ctx.deleteMessage(ctx.message.message_id); // Apagar a mensagem enviada pelo usuário
    const mensagem = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
        caption: mensagemErro,
        reply_markup: {
            inline_keyboard: [
                [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
            ]
        }
    });
    ctx.session.mensagensIDS.push(mensagem.message_id); // Adicionar a mensagem à sessão para exclusão futura
};

// Manipulador de texto para diferentes fluxos
bot.on('text', async (ctx) => {
    if (ctx.session.awaitingPhoneNumberForPix) {
        await cadastrarPix.handlePixText(ctx);
    } else if (ctx.session.awaitingPhoneNumberForGame) {
        await jogoAcumulado6.handleJogoAcumulado6Text(ctx); // Use a função corretamente
    } else if (ctx.session.awaitingNumeroConcurso) {
        await escutarNumeroConcurso(ctx);
    } else if (ctx.session.step) {
        await cadastrarPix.handlePixText(ctx);
    } else {
        await enviarMensagemErroComLogo(ctx, 'Comando ou texto não reconhecido.');
    }
});

// Chamar a função para envio de Mensagens Assincronas
enviarMensagemPagamentoPendente();

bot.action('participar_jogo_acumulado6', (ctx) => {
    jogoAcumulado6.validatePhoneNumberAcumulado6(ctx, ctx.from.phone_number);
});

bot.action('participar_jogo_acumulado10', (ctx) => mensagemEmDesenvolvimento(ctx, 'Acumulado - 10 Números 10 Acertos'));
bot.action('participar_jogo_tiro_certo', (ctx) => mensagemEmDesenvolvimento(ctx, 'Tiro Certo'));

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
