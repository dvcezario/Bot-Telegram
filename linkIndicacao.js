const xlsx = require('xlsx');
const fs = require('fs');

// Variáveis de exemplo para o contador e última indicação
let contadorIndicacoes = 0;
let ultimaIndicacao = '';

// Função para verificar se um jogador já foi indicado antes
function jogadorJaIndicou(id) {
    const workbook = lerPlanilhaIndicacao();
    if (!workbook) {
        criarPlanilhaIndicacao();
        return false;
    }
    const worksheet = workbook.Sheets['Indicacao'];
    if (!worksheet) return false;

    const indicacoesData = xlsx.utils.sheet_to_json(worksheet);
    const jogadorExistente = indicacoesData.find(jogador => jogador['ID'] === id);
    return jogadorExistente;
}

// Função para apresentar o link de indicação
function apresentarLinkIndicacao(ctx) {
    const idUsuario = ctx.from.id;
    const jogadorExistente = jogadorJaIndicou(idUsuario);

    if (jogadorExistente) {
        const mensagem = `Você já fez ${jogadorExistente['Indicacoes']} indicações.\nÚltima indicação: ${jogadorExistente['UltimaIndicacao']}`;
        ctx.reply(mensagem);
    } else {
        ctx.reply('Digite o nome do jogador que você está indicando:');
        ctx.session.step = 'obterNomeJogador';
    }
}

// Função para lidar com a resposta do usuário ao digitar o nome do jogador
function obterNomeJogador(ctx) {
    const nomeJogador = ctx.message.text.trim();
    ctx.session.nomeJogador = nomeJogador;
    ctx.reply('Digite o telefone do jogador:');
    ctx.session.step = 'obterTelefoneJogador';
}

// Função para lidar com a resposta do usuário ao digitar o telefone do jogador
function obterTelefoneJogador(ctx) {
    const telefoneJogador = ctx.message.text.trim();
    const nomeJogador = ctx.session.nomeJogador;

    const resultado = processarIndicacao(nomeJogador, telefoneJogador, ctx.from.id, ctx.from.first_name, ctx.from.last_name);
    ctx.reply(resultado);

    // Limpa a sessão
    delete ctx.session.step;
    delete ctx.session.nomeJogador;
}

// Função para verificar se um jogador já jogou anteriormente
function jogadorJaJogou(nome, telefone) {
    const workbook = lerPlanilhaJogadoresQueJogaram();
    if (!workbook) {
        criarPlanilhaJogadoresQueJogaram();
        return false;
    }
    const worksheet = workbook.Sheets['JogadoresQueJogaram'];
    if (!worksheet) return false;

    const jogadoresData = xlsx.utils.sheet_to_json(worksheet);
    return jogadoresData.some(jogador => jogador['Nome'] === nome && jogador['Telefone'] === telefone);
}

// Função para criar a planilha "JogadoresQueJogaram" se não existir
function criarPlanilhaJogadoresQueJogaram() {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([['Nome', 'Telefone']]);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'JogadoresQueJogaram');
    xlsx.writeFile(workbook, 'JogadoresQueJogaram.xlsx');
}

// Função para ler a planilha "JogadoresQueJogaram"
function lerPlanilhaJogadoresQueJogaram() {
    if (!fs.existsSync('JogadoresQueJogaram.xlsx')) return null;
    return xlsx.readFile('JogadoresQueJogaram.xlsx');
}

// Função para criar a planilha "Indicacao" se não existir
function criarPlanilhaIndicacao() {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([['Nome', 'Sobrenome', 'ID', 'Indicacoes', 'UltimaIndicacao']]);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Indicacao');
    xlsx.writeFile(workbook, 'Indicacao.xlsx');
}

// Função para ler a planilha "Indicacao"
function lerPlanilhaIndicacao() {
    if (!fs.existsSync('Indicacao.xlsx')) return null;
    return xlsx.readFile('Indicacao.xlsx');
}

// Função para registrar a indicação de um jogador
function registrarIndicacao(nome, telefone, id, nomeIndicado) {
    const workbook = lerPlanilhaIndicacao();
    const worksheet = workbook.Sheets['Indicacao'];
    const indicacoesData = xlsx.utils.sheet_to_json(worksheet);

    const jogadorExistente = indicacoesData.find(jogador => jogador['ID'] === id);
    if (jogadorExistente) {
        jogadorExistente['Indicacoes']++;
        jogadorExistente['UltimaIndicacao'] = nomeIndicado;
    } else {
        const novaIndicacao = {
            'Nome': nome,
            'Sobrenome': telefone,
            'ID': id,
            'Indicacoes': 1,
            'UltimaIndicacao': nomeIndicado
        };
        indicacoesData.push(novaIndicacao);
    }

    const newWorksheet = xlsx.utils.json_to_sheet(indicacoesData);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Indicacao');
    xlsx.writeFile(newWorkbook, 'Indicacao.xlsx');
}

// Função para processar a indicação
function processarIndicacao(nome, telefone, id, nomeIndicado, sobrenomeIndicado) {
    if (!jogadorJaJogou(nome, telefone)) {
        const workbook = lerPlanilhaJogadoresQueJogaram();
        const worksheet = workbook.Sheets['JogadoresQueJogaram'];
        const jogadoresData = xlsx.utils.sheet_to_json(worksheet);
        jogadoresData.push({'Nome': nome, 'Telefone': telefone});
        const newWorksheet = xlsx.utils.json_to_sheet(jogadoresData);
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'JogadoresQueJogaram');
        xlsx.writeFile(newWorkbook, 'JogadoresQueJogaram.xlsx');

        registrarIndicacao(nomeIndicado, sobrenomeIndicado, id, nome);

        return `Parabéns! Sua indicação está elegível e você ganhou 15% do valor da aposta do jogador ${nome}.`;
    } else {
        return `Este jogador já jogou anteriormente e não é elegível para bonificação.`;
    }
}

module.exports = {
    apresentarLinkIndicacao,
    obterNomeJogador,
    obterTelefoneJogador
};
