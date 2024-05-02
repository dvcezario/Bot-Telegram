const { Markup } = require('telegraf');
const axios = require('axios');
const bot = require('./bot');
const session = require('telegraf/session');
const telaInicial = require('./telaInicial'); // Importe a função de apresentar a tela inicial
// Importa o array para armazrenar os IDs das mensagens
const { mensagensIDS } = require('./telaInicial');
let aguardandoNumeroConcurso = false;
let ultimoConcursoConsultado; // Variável para armazenar o número do último concurso consultado

async function obterUltimoResultado() {
    try {
        const response = await axios.get('https://loteriascaixa-api.herokuapp.com/api/megasena/latest');
        return response.data;
    } catch (error) {
        console.error('Erro ao obter o último resultado da Mega-Sena:', error);
        return null;
    }
}

// Função para apresentar todos os resultados
async function apresentarTodosResultados(ctx) {
    const ultimoResultado = await obterUltimoResultado();
    if (!ultimoResultado) {
        ctx.reply('Desculpe, não foi possível obter as informações do concurso no momento.');
        return;
    }

    ultimoConcursoConsultado = ultimoResultado.concurso;
    const formattedResult = formatarResultado(ultimoResultado);
    const buttons = criarBotoesPadrao();


    const salvarIdInfo = await ctx.editMessageCaption('Informações sobre o concurso:');
    if (salvarIdInfo) {
        ctx.session.mensagensIDS.push(salvarIdInfo.message_id);
    }

    const salvarId = await ctx.reply(formattedResult, Markup.inlineKeyboard(buttons));
    if (ctx.message) {
        ctx.session.mensagensIDS.push(ctx.message.message_id);
    }
    if (salvarId) {
        ctx.session.mensagensIDS.push(salvarId.message_id);
    }

}

async function apresentarResultadoAnterior(ctx) {
    if (!ultimoConcursoConsultado) {
        const buttons = criarBotoesPadrao();
        const salvarID5 = await ctx.replyWithMarkdown('Não existe concurso anterior.', Markup.inlineKeyboard(buttons));
        if (salvarID5) {
            ctx.session.mensagensIDS.push(salvarID5.message_id);
        }
        return;
    }

    const resultadoAnterior = await obterResultadoPorConcurso(ultimoConcursoConsultado - 1);
    if (!resultadoAnterior) {
        const buttons = criarBotoesPadrao();
        const salvarId4 = await ctx.replyWithMarkdown('Não existe concurso anterior.', Markup.inlineKeyboard(buttons));
        if (salvarId4) {
            ctx.session.mensagensIDS.push(salvarId4.message_id);
        }
        return;
    }

    ultimoConcursoConsultado--;
    const formattedResult = formatarResultado(resultadoAnterior);
    const buttons = criarBotoesPadrao();
    const salvarID3 = await ctx.editMessageText(formattedResult, Markup.inlineKeyboard(buttons));
    if (salvarID3) {
        ctx.session.mensagensIDS.push(salvarID3.message_id);
    }
}

async function apresentarResultadoProximo(ctx) {
    const proximoResultado = await obterResultadoPorConcurso(ultimoConcursoConsultado + 1);
    if (!proximoResultado) {
        const buttons = criarBotoesPadrao();
        const salvarID = await ctx.editMessageText(`O concurso ${ultimoConcursoConsultado + 1} ainda não foi realizado.`, Markup.inlineKeyboard(buttons));
        if (salvarID) {
            ctx.session.mensagensIDS.push(salvarID.message_id);
        }
        return;
    }

    ultimoConcursoConsultado++;
    const formattedResult = formatarResultado(proximoResultado);
    const buttons = criarBotoesPadrao();
    const salvarId2 = ctx.editMessageText(formattedResult, Markup.inlineKeyboard(buttons));
    if (salvarId2) {
        ctx.session.mensagensIDS.push(salvarId2.message_id);
    }
}

// Fora da função buscarResultadoPorConcurso
bot.on('text', textListener);

// Função para buscar resultado por concurso
async function buscarResultadoPorConcurso(ctx) {
    let message;
    if (ctx.callbackQuery.message.text) {
        message = await ctx.editMessageText('Por favor, digite o número do concurso:');
    } else if (ctx.callbackQuery.message.photo) {
        message = await ctx.editMessageCaption('Por favor, digite o número do concurso:');
    }
    if (message) {
        ctx.session.mensagensIDS.push(message.message_id);
        aguardandoNumeroConcurso = true; // Atualize a variável de estado
    }
}

async function textListener(ctx) {
    try {
        if (aguardandoNumeroConcurso) {
            const numeroConcurso = parseInt(ctx.message.text.trim(), 10);
            const resultado = await obterResultadoPorConcurso(numeroConcurso, ctx);
            if (!resultado) {
                const buttons = criarBotoesPadrao();
                const salvarID = await ctx.replyWithMarkdown('Resultado não encontrado para o concurso informado.', Markup.inlineKeyboard(buttons));
                if (salvarID) {
                    ctx.session.mensagensIDS.push(salvarID.message_id);
                }
                return;
            }

            ultimoConcursoConsultado = numeroConcurso;
            const formattedResult = formatarResultado(resultado);
            const buttons = criarBotoesPadrao();
            const concursoBuscado = await ctx.reply(formattedResult, Markup.inlineKeyboard(buttons));
            if (concursoBuscado) {
                await ctx.session.mensagensIDS.push(concursoBuscado.message_id);
            }
        }
    } catch (error) {
        console.error('Erro em textListener:', error);
    }
}


bot.action('resultado_anterior', apresentarResultadoAnterior);
bot.action('resultado_proximo', apresentarResultadoProximo);
bot.action('buscar_concurso', buscarResultadoPorConcurso);
bot.action(telaInicial.MENU_INICIAL, telaInicial.apresentarTelaInicial);

async function obterResultadoPorConcurso(concurso, ctx) {
    try {
        const response = await axios.get(`https://loteriascaixa-api.herokuapp.com/api/megasena/${concurso}`);
        return response.data;
    } catch {
        const buttons = criarBotoesPadrao();
        if (ctx.reply) {
            ctx.reply(`Erro ao obter resultados do concurso ${concurso}:`, Markup.inlineKeyboard(buttons), { parse_mode: 'Markdown' });
        } else if (ctx.telegram && ctx.telegram.sendMessage) {
            ctx.telegram.sendMessage(ctx.chat.id, `Erro ao obter resultados do concurso ${concurso}:`, { parse_mode: 'Markdown' });
        }
        return 'Olá';
    }
}

function criarBotoesPadrao() {
    return [
        [
            Markup.button.callback('⏮️ Concurso Anterior', 'resultado_anterior'),
            Markup.button.callback('⏭️ Próximo Concurso', 'resultado_proximo')
        ],
        [
            Markup.button.callback('🔍 Buscar Concurso', 'buscar_concurso')
        ],
        [
            Markup.button.callback('🏠 Menu Inicial', 'voltar')
        ]
    ];
}

function formatarResultado(resultado) {
    const {
        concurso,
        data,
        dezenas
    } = resultado;

    const numerosSorteados = dezenas.join(' ');

    const returnConcurso = `Concurso: ${concurso}
Data: ${data}
Números sorteados: ${numerosSorteados}`;

    mensagensIDS.push(returnConcurso.message_id);
    return returnConcurso;
}

module.exports = {
    apresentarTodosResultados,
    apresentarResultadoAnterior,
    apresentarResultadoProximo,
    obterUltimoResultado,
    obterResultadoPorConcurso,
    buscarResultadoPorConcurso,
    criarBotoesPadrao,
    formatarResultado,
    ultimoConcursoConsultado,
    mensagensIDS,
    session
};
