//mensagensAssincronas.js

const cron = require('node-cron');

// Função para enviar mensagem de lembrete para o dia do sorteio
function enviarLembreteSorteio() {
    // Lógica para enviar mensagem de lembrete para o dia do sorteio
    console.log('Enviando lembrete para o dia do sorteio...');
}

// Função para enviar mensagem de lembrete para o dia de início da rodada
function enviarLembreteInicioRodada() {
    // Lógica para enviar mensagem de lembrete para o dia de início da rodada
    console.log('Enviando lembrete para o dia de início da rodada...');
}

// Função para enviar mensagem sobre pagamento pendente
function enviarMensagemPagamentoPendente() {
    // Lógica para enviar mensagem sobre pagamento pendente
    console.log('Enviando mensagem sobre pagamento pendente...');
}

// Agendar envio de mensagens
cron.schedule('0 9 * * *', enviarLembreteSorteio); // Envio diário às 9h
cron.schedule('0 9 * * 1', enviarLembreteInicioRodada); // Envio semanal às 9h de segunda-feira
cron.schedule('0 9 1 * *', enviarMensagemPagamentoPendente); // Envio mensal no primeiro dia do mês às 9h

module.exports = {
    enviarLembreteSorteio,
    enviarLembreteInicioRodada,
    enviarMensagemPagamentoPendente
};
