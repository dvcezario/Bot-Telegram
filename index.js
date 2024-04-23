// index.js

const { Markup } = require('telegraf');
const bot = require('./bot');
const resultados = require('./resultados')
const participarDoJogo = require('./participardoJogo');

const { apresentarTelaInicial, MENU_INICIAL } = require('./telaInicial');
const { apresentarMenuClassificacao, apresentarMenuResultados, apresentarMenuJogar, apresentarInformacoesJogo, apresentarMenuLinkIndicacao, apresentarMenuAjuda, apresentarSubMenuAcertoAcumulado } = require('./menu');
const { apresentarTodosResultados, apresentarResultadoAnterior, apresentarResultadoProximo } = require('./resultados');
const { apresentarClassificacaoGeral, apresentarClassificacaoRodada } = require('./classificacao');
const { apresentarPremiacoes, apresentarPlanilhaJogadores } = require('./jogar');
const { validatePhoneNumber } = require('./participardoJogo'); 
const { enviarVideoExplicativo, enviarTextoExplicativo, enviarInformacoesPagamento, enviarInformacoesRecebimento } = require('./menuInformacoes');
const mercadopago = require('./mercadopago');



bot.start(apresentarTelaInicial);

bot.action('menu_classificacao', apresentarMenuClassificacao);
bot.action('menu_resultados', apresentarMenuResultados);
bot.action('menu_jogar', apresentarMenuJogar);
bot.action('classificacao_geral', apresentarClassificacaoGeral);
bot.action('classificacao_rodada', apresentarClassificacaoRodada);
bot.action('resultado_anterior', apresentarResultadoAnterior);
bot.action('resultado_proximo', apresentarResultadoProximo);
bot.action('voltar', apresentarTelaInicial);
bot.action('todos_resultados', apresentarTodosResultados);
bot.action('acerto_acumulado', apresentarSubMenuAcertoAcumulado);
bot.action('premiacoes', apresentarPremiacoes);
bot.action('planilha_jogadores', apresentarPlanilhaJogadores);
bot.action('ajuda', apresentarMenuAjuda);
bot.action('link_indicacao', apresentarMenuLinkIndicacao);
bot.action('menu_informacoes', apresentarInformacoesJogo);
bot.action('video_explicativo', enviarVideoExplicativo);
bot.action('texto_explicativo', enviarTextoExplicativo);
bot.action('informacoes_pagamento', enviarInformacoesPagamento);
bot.action('informacoes_recebimento', enviarInformacoesRecebimento);


bot.action('participar_jogo', (ctx) => {
    validatePhoneNumber(ctx, ctx.from.phone_number);
});

bot.launch();