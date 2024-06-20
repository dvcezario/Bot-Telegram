const fs = require('fs');
const xlsx = require('xlsx');
const bot = require('./bot');
const lockfile = require('proper-lockfile');
const path = require('path');
const { deleteAllMessages } = require('./telaInicial');
const { proximaRodadaData } = require('./config');

const photoPath = path.join(__dirname, 'Logo3.jpg');

// Função para salvar as informações do Pix em uma planilha do Excel
async function salvarInformacoesPix(valorChavePix, tipoChavePix, nomeRecebedor, nomeBanco, numeroTelefone, ctx) {
    const fileName = 'InformacoesPix.xlsx';
    const filePath = path.join(__dirname, fileName);
    const nomeUsuario = ctx.message.from.first_name;
    const idUsuario = ctx.message.from.id;

    // Verifica se o arquivo da planilha já existe
    if (!fs.existsSync(filePath)) {
        // Cria uma nova planilha se não existir
        const worksheetData = [
            ['Nome do Usuário', 'ID do Usuário', 'Número de Telefone', 'Tipo de Chave Pix', 'Valor da Chave Pix', 'Nome do Recebedor', 'Nome do Banco'],
        ];
        const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'InformacoesPix');
        xlsx.writeFile(workbook, filePath);
    }

    let release;
    try {
        release = await lockfile.lock(filePath);

        const workbook = xlsx.readFile(filePath);
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
        xlsx.writeFile(workbook, filePath);

        return 'Chave Pix cadastrada com sucesso!';
    } catch (error) {
        console.error('Erro ao salvar informações do Pix:', error);
        return 'Erro ao cadastrar a chave Pix.';
    } finally {
        if (release) {
            await release();
        }
    }
}

// Função para enviar mensagens com a logo
async function enviarMensagemComLogo(ctx, mensagem) {
    const photo = fs.readFileSync(photoPath);
    const salvarId = await ctx.replyWithPhoto({ source: photo }, {
        caption: mensagem,
        reply_markup: {
            inline_keyboard: [
                [{ text: '❖ Cadastrar Pix', callback_data: 'menu_cadastrar_pix' }],
                [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
            ]
        }
    });
    if (salvarId) {
        ctx.session.mensagensIDS.push(salvarId.message_id);
    }
}

// Função genérica para validar e obter texto do usuário
async function obterTexto(ctx, regex, mensagemErro, tipoChave, proximoPasso) {
    const valor = ctx.message.text.trim();
    if (!regex.test(valor)) {
        await enviarMensagemComLogo(ctx, mensagemErro);
        await ctx.deleteMessage(ctx.message.message_id);
        return;
    }
    ctx.session.tipoChavePix = tipoChave;
    ctx.session.valorChavePix = valor;
    ctx.session.step = proximoPasso;
    const mensagemProxima = 'Por favor, digite o nome do recebedor.';
    await enviarMensagemComLogo(ctx, mensagemProxima);
    await ctx.deleteMessage(ctx.message.message_id);
}

// Funções para obter cada tipo de chave Pix
async function obterCPF_CNPJ(ctx) {
    await obterTexto(ctx, /^\d{11}$|^\d{14}$/, 'Por favor, digite um CPF válido (11 dígitos) ou um CNPJ válido (14 dígitos).', 'CPF/CNPJ', 'obterNomeRecebedor');
}

async function obterEmail(ctx) {
    await obterTexto(ctx, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Por favor, digite um e-mail válido.', 'E-MAIL', 'obterNomeRecebedor');
}

async function obterCelular(ctx) {
    await obterTexto(ctx, /^\d{2}\s?\d{9}$/, 'Por favor, digite um número de celular válido com 11 dígitos.', 'CELULAR', 'obterNomeRecebedor');
}

async function obterChaveAleatoria(ctx) {
    await obterTexto(ctx, /^.{32}$/, 'Por favor, digite uma chave aleatória válida com 32 caracteres.', 'CHAVE', 'obterNomeRecebedor');
}

// Função para obter o nome do recebedor
async function obterNomeRecebedor(ctx) {
    ctx.session.nomeRecebedor = ctx.message.text.trim();
    ctx.session.step = 'obterNomeBanco';
    const mensagemProxima = 'Por favor, digite o nome do banco.';
    await enviarMensagemComLogo(ctx, mensagemProxima);
    await ctx.deleteMessage(ctx.message.message_id);
}

// Função para obter o nome do banco
async function obterNomeBanco(ctx) {
    ctx.session.nomeBanco = ctx.message.text.trim();
    ctx.session.step = 'obterNumeroTelefone';
    const mensagemProxima = 'Por favor, digite o número de telefone.';
    await enviarMensagemComLogo(ctx, mensagemProxima);
    await ctx.deleteMessage(ctx.message.message_id);
}

// Função para obter o número de telefone
async function obterNumeroTelefone(ctx) {
    const numeroTelefone = ctx.message.text.trim();
    const regex = /^\d{2}\s?\d{9}$/;
    if (!regex.test(numeroTelefone)) {
        await enviarMensagemComLogo(ctx, 'Por favor, digite um número de telefone válido com 11 dígitos.');
        await ctx.deleteMessage(ctx.message.message_id);
        return;
    }
    ctx.session.numeroTelefone = numeroTelefone;

    // Salva as informações do Pix na planilha
    const mensagem = await salvarInformacoesPix(ctx.session.valorChavePix, ctx.session.tipoChavePix, ctx.session.nomeRecebedor, ctx.session.nomeBanco, ctx.session.numeroTelefone, ctx);

    // Enviar mensagem final com a logo
    if (ctx.session.mensagensIDS.length > 0) {
        await deleteAllMessages(ctx);
    }
    const photo = fs.readFileSync(photoPath);
    const salvarId = await ctx.replyWithPhoto({ source: photo }, {
        caption: mensagem,
        reply_markup: {
            inline_keyboard: [
                [{ text: '❖ Cadastrar Pix', callback_data: 'menu_cadastrar_pix' }],
                [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
            ]
        }
    });

    if (salvarId) {
        ctx.session.mensagensIDS.push(salvarId.message_id);
    }

    await ctx.deleteMessage(ctx.message.message_id);

    // Limpa a sessão
    delete ctx.session.step;
    delete ctx.session.valorChavePix;
    delete ctx.session.tipoChavePix;
    delete ctx.session.nomeRecebedor;
    delete ctx.session.nomeBanco;
    delete ctx.session.numeroTelefone;
}

// Função para iniciar o cadastro de Pix
async function iniciarCadastroPix(ctx, tipo) {
    if (!ctx.session.userMessages) {
        ctx.session.userMessages = [];
    }
    if (ctx.session.userMessages.length > 0) {
        await deleteAllMessages(ctx);
    }
    ctx.session.step = tipo;

    let mensagemInicial;
    switch (tipo) {
        case 'obterCPF_CNPJ':
            mensagemInicial = 'Por favor, digite seu CPF ou CNPJ.';
            break;
        case 'obterEmail':
            mensagemInicial = 'Por favor, digite seu e-mail.';
            break;
        case 'obterCelular':
            mensagemInicial = 'Por favor, digite seu número de celular.';
            break;
        case 'obterChaveAleatoria':
            mensagemInicial = 'Por favor, digite sua chave aleatória.';
            break;
        default:
            mensagemInicial = 'Por favor, digite a informação solicitada.';
    }

    await enviarMensagemComLogo(ctx, mensagemInicial);
}

// Funções para cadastrar cada tipo de chave Pix
async function cadastrarPixCPF_CNPJ(ctx) {
    await iniciarCadastroPix(ctx, 'obterCPF_CNPJ');
}

async function cadastrarPixEmail(ctx) {
    await iniciarCadastroPix(ctx, 'obterEmail');
}

async function cadastrarPixCelular(ctx) {
    await iniciarCadastroPix(ctx, 'obterCelular');
}

async function cadastrarPixChaveAleatoria(ctx) {
    await iniciarCadastroPix(ctx, 'obterChaveAleatoria');
}

// Manipula o texto do usuário para diferentes etapas
async function handlePixText(ctx) {
    if (!ctx.session.userMessages) {
        ctx.session.userMessages = [];
    }
    ctx.session.userMessages.push(ctx.message.message_id);
    console.log(`Mensagem do usuário adicionada: ${ctx.message.message_id}`);

    switch (ctx.session.step) {
        case 'obterCPF_CNPJ':
            await obterCPF_CNPJ(ctx);
            break;
        case 'obterEmail':
            await obterEmail(ctx);
            break;
        case 'obterCelular':
            await obterCelular(ctx);
            break;
        case 'obterChaveAleatoria':
            await obterChaveAleatoria(ctx);
            break;
        case 'obterNomeRecebedor':
            await obterNomeRecebedor(ctx);
            break;
        case 'obterNomeBanco':
            await obterNomeBanco(ctx);
            break;
        case 'obterNumeroTelefone':
            await obterNumeroTelefone(ctx);
            break;
        default:
            const mensagemDefault = 'Por favor, use um comando válido para iniciar o cadastro.';
            await enviarMensagemComLogo(ctx, mensagemDefault);
    }
}

module.exports = {
    cadastrarPixCPF_CNPJ,
    cadastrarPixEmail,
    cadastrarPixCelular,
    cadastrarPixChaveAleatoria,
    handlePixText,
    obterCPF_CNPJ,
    obterEmail,
    obterCelular,
    obterChaveAleatoria,
    obterNomeRecebedor,
    obterNomeBanco,
    obterNumeroTelefone,
    salvarInformacoesPix
};
