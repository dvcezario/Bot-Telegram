const { Markup } = require('telegraf');
const axios = require('axios');
const bot = require('./bot');
const fs = require('fs');
const path = require('path');
const { mensagensIDS } = require('./telaInicial');

const photoPath = path.join(__dirname, 'Logo3.jpg');
let ultimoConcursoConsultado;

async function obterUltimoResultado() {
    try {
        const response = await axios.get('https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena');
        return response.data;
    } catch (error) {
        console.error('Erro ao obter o último resultado da Mega-Sena:', error);
        return null;
    }
}

async function apresentarTodosResultados(ctx) {
    const ultimoResultado = await obterUltimoResultado();
    if (!ultimoResultado) {
        await enviarMensagemComLogo(ctx, 'Desculpe, não foi possível obter as informações do concurso no momento.');
        return;
    }

    ultimoConcursoConsultado = ultimoResultado.numero;
    const formattedResult = formatarResultado(ultimoResultado);
    const buttons = criarBotoesPadrao();

    await enviarMensagemComLogo(ctx, formattedResult, buttons);
}

async function apresentarResultadoAnterior(ctx) {
    if (!ultimoConcursoConsultado || ultimoConcursoConsultado === 1) {
        await editarMensagem(ctx, 'Não existe concurso anterior.');
        return;
    }

    const resultadoAnterior = await obterResultadoPorConcurso(ultimoConcursoConsultado - 1);
    if (!resultadoAnterior) {
        await editarMensagem(ctx, 'Não existe concurso anterior.');
        return;
    }

    ultimoConcursoConsultado--;
    const formattedResult = formatarResultado(resultadoAnterior);
    await editarMensagem(ctx, formattedResult);
}

async function apresentarResultadoProximo(ctx) {
    const ultimoResultado = await obterUltimoResultado();
    if (ultimoConcursoConsultado + 1 > ultimoResultado.numero) {
        await editarMensagem(ctx, `O concurso ${ultimoConcursoConsultado + 1} ainda não foi realizado.`);
        return;
    }

    const proximoResultado = await obterResultadoPorConcurso(ultimoConcursoConsultado + 1);
    if (!proximoResultado) {
        await editarMensagem(ctx, `O concurso ${ultimoConcursoConsultado + 1} ainda não foi realizado.`);
        return;
    }

    ultimoConcursoConsultado++;
    const formattedResult = formatarResultado(proximoResultado);
    await editarMensagem(ctx, formattedResult);
}

async function buscarResultadoPorConcurso(ctx) {
    await enviarMensagemComLogo(ctx, 'Por favor, digite o número do concurso:');
    ctx.session.awaitingNumeroConcurso = true;
}

async function escutarNumeroConcurso(ctx) {
    await deleteMessageSafely(ctx, ctx.message.message_id); // Apagar a mensagem enviada pelo usuário
    const numeroConcurso = parseInt(ctx.message.text.trim(), 10);
    const resultado = await obterResultadoPorConcurso(numeroConcurso);
    if (!resultado) {
        await deleteAllMessages(ctx); // Apagar todas as mensagens anteriores
        await enviarMensagemComLogo(ctx, 'Resultado não encontrado para o concurso informado.\nDigite o numero de um concurso válido.');
        return;
    }

    ultimoConcursoConsultado = numeroConcurso;
    const formattedResult = formatarResultado(resultado);
    await enviarMensagemComLogo(ctx, formattedResult);
    ctx.session.awaitingNumeroConcurso = false;
}

async function obterResultadoPorConcurso(concurso) {
    try {
        const response = await axios.get(`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${concurso}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao obter resultados do concurso ${concurso}:`, error);
        return null;
    }
}

function criarBotoesPadrao() {
    return [
        [Markup.button.callback('⏮️ Concurso Anterior', 'resultado_anterior')],
        [Markup.button.callback('⏭️ Próximo Concurso', 'resultado_proximo')],
        [Markup.button.callback('🔍 Buscar Concurso', 'buscar_concurso')],
        [Markup.button.callback('🏠 Menu Inicial', 'voltar')]
    ];
}

function formatarResultado(resultado) {
    const { numero, dataApuracao, listaDezenas } = resultado;
    const numerosSorteados = listaDezenas.join(' ');

    return `Concurso: ${numero}\nData: ${dataApuracao}\nNúmeros sorteados: \n${numerosSorteados}`;
}

async function enviarMensagemComLogo(ctx, mensagem, buttons) {
    const opts = {
        caption: mensagem,
        reply_markup: {
            inline_keyboard: buttons || criarBotoesPadrao()
        }
    };

    const photo = fs.readFileSync(photoPath);
    const message = await ctx.replyWithPhoto({ source: photo }, opts);

    if (message) {
        ctx.session.mensagensIDS.push(message.message_id);
        ctx.session.mainMessageId = message.message_id;
        console.log(`Mensagem enviada com logo: ${message.message_id}`);
    }
}

async function editarMensagem(ctx, mensagem) {
    try {
        const mainMessageId = ctx.session.mainMessageId;
        if (!mainMessageId) {
            console.error('Main message ID not found');
            return;
        }

        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            mainMessageId,
            null,
            mensagem,
            {
                reply_markup: {
                    inline_keyboard: criarBotoesPadrao()
                }
            }
        );
    } catch (error) {
        console.error('Erro ao editar a mensagem:', error);
    }
}

async function deleteMessageSafely(ctx, messageId) {
    try {
        await ctx.deleteMessage(messageId);
        console.log(`Mensagem do usuário excluída: ${messageId}`);
    } catch (error) {
        if (error.code !== 400 && error.code !== 404) {
            console.error(`Erro ao excluir a mensagem do usuário com ID ${messageId}:`, error);
        }
    }
}

async function deleteAllMessages(ctx) {
    if (ctx.session && ctx.session.mensagensIDS) {
        for (const messageId of ctx.session.mensagensIDS) {
            await deleteMessageSafely(ctx, messageId);
        }
        ctx.session.mensagensIDS = [];
    }
}

module.exports = {
    apresentarTodosResultados,
    apresentarResultadoAnterior,
    apresentarResultadoProximo,
    obterUltimoResultado,
    obterResultadoPorConcurso,
    buscarResultadoPorConcurso,
    escutarNumeroConcurso,
    criarBotoesPadrao,
    formatarResultado,
    ultimoConcursoConsultado
};
