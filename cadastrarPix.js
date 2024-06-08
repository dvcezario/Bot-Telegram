// Importa os módulos necessários
const fs = require('fs');
const xlsx = require('xlsx');
const bot = require('./bot');

// Função para salvar as informações do Pix em uma planilha do Excel
function salvarInformacoesPix(valorChavePix, tipoChavePix, nomeRecebedor, nomeBanco, numeroTelefone, ctx) {
    const fileName = 'InformacoesPix.xlsx';
    const nomeUsuario = ctx.update.message.from.first_name;
    const idUsuario = ctx.update.message.from.id;
    
    // Verifica se o arquivo da planilha já existe
    if (fs.existsSync(fileName)) {
        const workbook = xlsx.readFile(fileName);
        const worksheet = workbook.Sheets['InformacoesPix'];

        // Verifica se a chave Pix já está cadastrada na planilha
        const existentPixData = xlsx.utils.sheet_to_json(worksheet);
        const existingPix = existentPixData.find(row => row['Tipo de Chave Pix'] === tipoChavePix && row['Valor da Chave Pix'] === valorChavePix);

        if (existingPix) {
            return 'Esta chave Pix já está cadastrada.';
        }

        // Adiciona as informações do Pix à planilha
        const newRow = [nomeUsuario, idUsuario, numeroTelefone, tipoChavePix, valorChavePix, nomeRecebedor, nomeBanco];
        xlsx.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });
        xlsx.writeFile(workbook, fileName);

        return 'Dados Pix salvos com sucesso.';
    } else {
        // Cria uma nova planilha e adiciona as informações do Pix
        const worksheetData = [
            ['Nome do Usuário', 'ID', 'Telefone', 'Tipo de Chave Pix', 'Valor da Chave Pix', 'Nome do Recebedor', 'Nome do Banco'],
            [nomeUsuario, idUsuario, numeroTelefone, tipoChavePix, valorChavePix, nomeRecebedor, nomeBanco]
        ];
        const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'InformacoesPix');
        xlsx.writeFile(workbook, fileName);

        return 'Dados Pix salvos com sucesso.';
    }
}

// Função para lidar com o cadastro de CPF/CNPJ
function cadastrarPixCPF_CNPJ(ctx) {
    ctx.reply('Digite o número do CPF/CNPJ:');
    ctx.session.step = 'obterCPF_CNPJ';
}

// Função para lidar com a resposta do usuário ao digitar o CPF/CNPJ
function obterCPF_CNPJ(ctx) {
    const valorChavePix = ctx.message.text.trim();
    let tipoChavePix;

    if (/^\d{11}$/.test(valorChavePix)) {
        tipoChavePix = 'CPF';
    } else if (/^\d{14}$/.test(valorChavePix)) {
        tipoChavePix = 'CNPJ';
    } else {
        ctx.reply('Por favor, digite um CPF válido (11 dígitos) ou um CNPJ válido (14 dígitos).');
        return;
    }

    ctx.session.valorChavePix = valorChavePix;
    ctx.session.tipoChavePix = tipoChavePix;
    obterRestanteDados(ctx);
}

// Função para lidar com o cadastro de e-mail
function cadastrarPixEmail(ctx) {
    ctx.reply('Digite o e-mail:');
    ctx.session.step = 'obterEmail';
}

// Função para lidar com a resposta do usuário ao digitar o e-mail
function obterEmail(ctx) {
    const valorChavePix = ctx.message.text.trim();
    const tipoChavePix = 'E-MAIL';
    
    // Verificação do formato do e-mail usando expressão regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valorChavePix)) {
        ctx.reply('Por favor, digite um e-mail válido.');
        return;
    }

    ctx.session.valorChavePix = valorChavePix;
    ctx.session.tipoChavePix = tipoChavePix;
    obterRestanteDados(ctx);
}

// Função para lidar com o cadastro de número de celular
function cadastrarPixCelular(ctx) {
    ctx.reply('Digite o número do Celular:');
    ctx.session.step = 'obterCelular';
}

// Função para lidar com a resposta do usuário ao digitar o número do celular
function obterCelular(ctx) {
    const valorChavePix = ctx.message.text.trim();
    const tipoChavePix = 'CELULAR';

    // Verifica se o número de celular tem 11 dígitos
    const regex = /^\d{2}\s?\d{9}$/;

    if (!regex.test(valorChavePix)) {
        ctx.reply('Por favor, digite um número de celular válido com 11 dígitos.');
        return;
    }

    ctx.session.valorChavePix = valorChavePix;
    ctx.session.tipoChavePix = tipoChavePix;
    obterRestanteDados(ctx);
}

// Função para lidar com o cadastro de chave aleatória
function cadastrarPixChaveAleatoria(ctx) {
    ctx.reply('Digite a chave aleatória:');
    ctx.session.step = 'obterChaveAleatoria';
}

// Função para lidar com a resposta do usuário ao digitar a chave aleatória
function obterChaveAleatoria(ctx) {
    const valorChavePix = ctx.message.text.trim();
    const tipoChavePix = 'CHAVE';

    // Verifica se o valor da chave aleatória tem exatamente 32 caracteres
    if (valorChavePix.length !== 32) {
        ctx.reply('Por favor, digite uma chave aleatória válida com 32 caracteres.');
        return;
    }

    ctx.session.valorChavePix = valorChavePix;
    ctx.session.tipoChavePix = tipoChavePix;
    obterRestanteDados(ctx);
}

// Função para solicitar o nome do recebedor da chave Pix
function obterRestanteDados(ctx) {
    ctx.reply('Agora digite o nome do recebedor da chave Pix:');
    ctx.session.step = 'obterNomeRecebedor';
}

// Função para lidar com a resposta do usuário ao digitar o nome do recebedor
function obterNomeRecebedor(ctx) {
    const nomeRecebedor = ctx.message.text.trim();
    ctx.session.nomeRecebedor = nomeRecebedor;
    ctx.reply('Digite o nome do banco:');
    ctx.session.step = 'obterNomeBanco';
}

// Função para lidar com a resposta do usuário ao digitar o nome do banco
function obterNomeBanco(ctx) {
    const nomeBanco = ctx.message.text.trim();
    ctx.session.nomeBanco = nomeBanco;
    ctx.reply('Digite seu número de telefone:');
    ctx.session.step = 'obterNumeroTelefone';
}

// Função para lidar com a resposta do usuário ao digitar o número de telefone
function obterNumeroTelefone(ctx) {
    const regex = /^\d{2}\s?\d{9,10}$/;
    const telefone = ctx.message.text.trim();
    if (!regex.test(telefone)) {
        ctx.reply('Por favor, digite um número de telefone válido no formato xx yyyyyyyyy ou xxyyyyyyyyy.');
        return;
    }
    ctx.session.numeroTelefone = telefone;
    const { valorChavePix, tipoChavePix, nomeRecebedor, nomeBanco, numeroTelefone } = ctx.session;
    const result = salvarInformacoesPix(valorChavePix, tipoChavePix, nomeRecebedor, nomeBanco, numeroTelefone, ctx);
    ctx.reply(result);
    ctx.session = null; // Limpa a sessão
}

// Exporta as funções para serem usadas em outros módulos
module.exports = {
    salvarInformacoesPix,
    cadastrarPixCPF_CNPJ,
    cadastrarPixEmail,
    cadastrarPixCelular,
    cadastrarPixChaveAleatoria,
    obterCPF_CNPJ,
    obterEmail,
    obterCelular,
    obterChaveAleatoria,
    obterNomeRecebedor,
    obterNomeBanco,
    obterNumeroTelefone
};
