// linkIndicacao.js

// Variáveis de exemplo para o contador e última indicação
let contadorIndicacoes = 0;
let ultimaIndicacao = '';

// Função para apresentar o link de indicação e retornar as variáveis
function apresentarLinkIndicacao(ctx) {
    // Obtém o ID do usuário que gerou o link
    idUsuarioGerador = ctx.from.id;

    // Obtém o nome do usuário que entrou no link
    const nomeUsuarioEntrou = ctx.from.first_name;

    // Verifica se a pessoa que entrou no link é diferente da pessoa que gerou o link
    if (ctx.from.id !== idUsuarioGerador) {
        // Atualiza o nome da última indicação
        ultimaIndicacao = nomeUsuarioEntrou;

        // Incrementa o contador de indicações
        contadorIndicacoes++;
    }

    // Gerar o link único para o bot do Telegram
    const linkBotTelegram = `https://t.me/DecadadaSorteBot?start=${ctx.from.id}`;

    // Mensagem de retorno com as informações e retorno das variáveis
    return {
        mensagem: `
        💰 Ganhe bônus de 15% da aposta do seu indicado.\n\n📈 Indicações: ${contadorIndicacoes}\n🏷 Última indicação: ${ultimaIndicacao}\n\n🔗 Link\n${linkBotTelegram}
        `,
        contadorIndicacoes,
        ultimaIndicacao
    };
}

module.exports = {
    apresentarLinkIndicacao
};
