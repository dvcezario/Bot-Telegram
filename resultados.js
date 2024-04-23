const { Markup } = require('telegraf');
const axios = require('axios');
const bot = require('./bot');
const telaInicial = require('./telaInicial'); // Importe a função de apresentar a tela inicial
// Importa o array para armazrenar os IDs das mensagens
const { mensagensIDS } = require('./telaInicial');

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

    ctx.editMessageCaption('Informações sobre o concurso:');
    ctx.reply(formattedResult, Markup.inlineKeyboard(buttons));
    if (ctx.message) {
        mensagensIDS.push(ctx.message.message_id);
    }
    console.log('MensagensIDS', mensagensIDS);
}

async function apresentarResultadoAnterior(ctx) {
    if (!ultimoConcursoConsultado) {
        const buttons = criarBotoesPadrao();
        ctx.replyWithMarkdown('Não existe concurso anterior.', Markup.inlineKeyboard(buttons));
        return;
    }

    const resultadoAnterior = await obterResultadoPorConcurso(ultimoConcursoConsultado - 1);
    if (!resultadoAnterior) {
        const buttons = criarBotoesPadrao();
        ctx.replyWithMarkdown('Não existe concurso anterior.', Markup.inlineKeyboard(buttons));
        return;
    }

    ultimoConcursoConsultado--;
    const formattedResult = formatarResultado(resultadoAnterior);
    const buttons = criarBotoesPadrao();
    ctx.editMessageText(formattedResult, Markup.inlineKeyboard(buttons));
}

async function apresentarResultadoProximo(ctx) {
    const proximoResultado = await obterResultadoPorConcurso(ultimoConcursoConsultado + 1);
    if (!proximoResultado) {
        const buttons = criarBotoesPadrao();
        ctx.editMessageText(`O concurso ${ultimoConcursoConsultado + 1} ainda não foi realizado.`, Markup.inlineKeyboard(buttons));
        return;
    }

    ultimoConcursoConsultado++;
    const formattedResult = formatarResultado(proximoResultado);
    const buttons = criarBotoesPadrao();
    ctx.editMessageText(formattedResult, Markup.inlineKeyboard(buttons));
}

// Função para buscar resultado por concurso
async function buscarResultadoPorConcurso(ctx) {
    let message;
    if (ctx.callbackQuery.message.text) {
        message = await ctx.editMessageText('Por favor, digite o número do concurso:');
    } else if (ctx.callbackQuery.message.photo) {
        message = await ctx.editMessageCaption('Por favor, digite o número do concurso:');
    }
    bot.on('text', textListener);
    if (message) {
        mensagensIDS.push(message.message_id);
    }
    console.log('MensagensIDS', mensagensIDS);
}

async function obterResultadoPorConcurso(numeroConcurso) {
    // Implemente a lógica para obter o resultado do concurso aqui.
    // Esta é apenas uma função de exemplo e pode não funcionar corretamente sem ajustes.
    try {
        const resultado = await lotofacil.getResultsByNumber(numeroConcurso);
        return resultado;
    } catch (error) {
        console.error('Erro ao obter resultados do concurso:', error);
        return null;
    }
}

async function textListener(ctx) {
    const numeroConcurso = parseInt(ctx.message.text.trim(), 10);
    const resultado = await obterResultadoPorConcurso(numeroConcurso);
    if (!resultado) {
        const buttons = criarBotoesPadrao();
        ctx.replyWithMarkdown('Resultado não encontrado para o concurso informado.', Markup.inlineKeyboard(buttons));
        return;
    }

    ultimoConcursoConsultado = numeroConcurso;
    const formattedResult = formatarResultado(resultado);
    const buttons = criarBotoesPadrao();
    ctx.reply(formattedResult, Markup.inlineKeyboard(buttons));
};

bot.action('resultado_anterior', apresentarResultadoAnterior);
bot.action('resultado_proximo', apresentarResultadoProximo);
bot.action('buscar_concurso', buscarResultadoPorConcurso);
bot.action(telaInicial.MENU_INICIAL, telaInicial.apresentarTelaInicial);

async function obterResultadoPorConcurso(concurso) {
    try {
        const response = await axios.get(`https://loteriascaixa-api.herokuapp.com/api/megasena/${concurso}`);
        return response.data;
    } catch (error) {
        const buttons = criarBotoesPadrao();
        ctx.replyWithMarkdown('Erro ao obter resultados do concurso ${concurso}:', Markup.inlineKeyboard(buttons));
        return null;
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

    return `Concurso: ${concurso}
Data: ${data}
Números sorteados: ${numerosSorteados}`;
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
    mensagensIDS
};
