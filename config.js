let dia = 8;
let mes = 'Junho';
let ano = 2024;

//let proximaRodadaData = `Nossa próxima rodada inicia-se ${dia} de ${mes} de ${ano}`;
let proximaRodadaData = `Nossa próxima rodada ainda esta com data a definir`;

function definirProximaRodada(diaNovo, mesNovo, anoNovo) {
    dia = diaNovo;
    mes = mesNovo;
    ano = anoNovo;
    atualizarProximaRodadaData();
}

function atualizarProximaRodadaData() {
    proximaRodadaData = `Nossa próxima rodada inicia-se ${dia} de ${mes} de ${ano}`;
}

function obterProximaRodadaData() {
    return proximaRodadaData;
}

module.exports = {
    definirProximaRodada,
    obterProximaRodadaData,
    atualizarProximaRodadaData,
    dia,
    mes,
    ano
};
