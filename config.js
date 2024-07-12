// config.js

// Variáveis de configuração para a data da próxima rodada
let dia = 16;
let mes = 'Julho';
let ano = 2024;

let proximaRodadaData = `Nossa próxima rodada inicia-se ${dia} de ${mes} de ${ano}`;
// let proximaRodadaData = `Nossa próxima rodada ainda esta com data a definir`;

/**
 * Função para definir a data da próxima rodada.
 * @param {number} diaNovo - Novo dia da rodada.
 * @param {string} mesNovo - Novo mês da rodada.
 * @param {number} anoNovo - Novo ano da rodada.
 */
function definirProximaRodada(diaNovo, mesNovo, anoNovo) {
    dia = diaNovo;
    mes = mesNovo;
    ano = anoNovo;
    atualizarProximaRodadaData();
}

/**
 * Função para atualizar a mensagem com a data da próxima rodada.
 */
function atualizarProximaRodadaData() {
    proximaRodadaData = `Nossa próxima rodada inicia-se ${dia} de ${mes} de ${ano}`;
}

/**
 * Função para obter a mensagem com a data da próxima rodada.
 * @returns {string} - Mensagem com a data da próxima rodada.
 */
function obterProximaRodadaData() {
    return proximaRodadaData;
}

// Exporta as funções e variáveis necessárias
module.exports = {
    definirProximaRodada,
    obterProximaRodadaData,
    atualizarProximaRodadaData,
    dia,
    mes,
    ano
};
