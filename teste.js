const xlsx = require('xlsx');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api'); // Importa a classe TelegramBot

// Token do seu bot do Telegram
const token = 'SEU_TOKEN_AQUI';

// Inicialize o bot do Telegram
const bot = new TelegramBot(token, { polling: true });

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
    const worksheet = xlsx.utils.aoa_to_sheet([['Nome', 'Sobrenome', 'Telefone']]);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'JogadoresQueJogaram');
    xlsx.writeFile(workbook, 'JogadoresQueJogaram.xlsx');
}

// Função para ler a planilha "JogadoresQueJogaram"
function lerPlanilhaJogadoresQueJogaram() {
    if (!fs.existsSync('JogadoresQueJogaram.xlsx')) return null;
    return xlsx.readFile('JogadoresQueJogaram.xlsx');
}

// Função para verificar se um jogador já foi indicado antes
function jogadorJaFoiIndicado(id) {
    const workbook = lerPlanilhaIndicacao();
    if (!workbook) {
        criarPlanilhaIndicacao();
        return false;
    }
    const worksheet = workbook.Sheets['Indicacao'];
    if (!worksheet) return false;

    const indicacoesData = xlsx.utils.sheet_to_json(worksheet);
    return indicacoesData.some(jogador => jogador['ID'] === id);
}

// Função para criar a planilha "Indicacao" se não existir
function criarPlanilhaIndicacao() {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([['Nome', 'Sobrenome', 'ID', 'Indicacoes']]);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Indicacao');
    xlsx.writeFile(workbook, 'Indicacao.xlsx');
}

// Função para registrar a indicação de um jogador
function registrarIndicacao(nome, sobrenome, id) {
    const workbook = lerPlanilhaIndicacao();
    const worksheet = workbook.Sheets['Indicacao'];
    const indicacoesData = xlsx.utils.sheet_to_json(worksheet);

    const jogadorExistente = indicacoesData.find(jogador => jogador['ID'] === id);
    if (jogadorExistente) {
        jogadorExistente['Indicacoes']++;
    } else {
        const novoJogador = {
            'Nome': nome,
            'Sobrenome': sobrenome,
            'ID': id,
            'Indicacoes': 1
        };
        indicacoesData.push(novoJogador);
    }

    const newWorksheet = xlsx.utils.json_to_sheet(indicacoesData);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Indicacao');
    xlsx.writeFile(newWorkbook, 'Indicacao.xlsx');
}

// Função para processar a indicação
function processarIndicacao(nome, sobrenome, telefone, id) {
    if (!jogadorJaJogou(nome, telefone)) {
        const workbook = lerPlanilhaJogadoresQueJogaram();
        const worksheet = workbook.Sheets['JogadoresQueJogaram'];
        const jogadoresData = xlsx.utils.sheet_to_json(worksheet);
        jogadoresData.push({'Nome': nome, 'Sobrenome': sobrenome, 'Telefone': telefone});
        const newWorksheet = xlsx.utils.json_to_sheet(jogadoresData);
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'JogadoresQueJogaram');
        xlsx.writeFile(newWorkbook, 'JogadoresQueJogaram.xlsx');

        registrarIndicacao(nome, sobrenome, id);

        return `Parabéns! Sua indicação está elegível e você ganhou 15% do valor da aposta do jogador ${nome}.`;
    } else {
        return `Este jogador já jogou anteriormente e não é elegível para bonificação.`;
    }
}

// Função para apresentar o link de indicação
function apresentarLinkIndicacao(ctx) {
    ctx.reply('Digite o nome do jogador que você está indicando:');
    ctx.session = { step: 'obterNomeJogador' };
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
    const idJogador = ctx.from.id;

    const resultado = processarIndicacao(nomeJogador, sobrenomeJogador, telefoneJogador, idJogador); // Corrigido para passar sobrenomeJogador
    ctx.reply(resultado);

    // Limpa a sessão
    ctx.session = null;
}
