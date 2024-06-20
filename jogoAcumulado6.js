const { isValidPhoneNumber, gerarQRCodePix, inserirIDPagamentoNaPlanilha, createNumericKeyboard, salvarNumerosSelecionadosAcumulado6 } = require('./funcoesJogosComuns');
const { Markup } = require('telegraf');
const { deleteAllMessages, apresentarTelaInicial } = require('./telaInicial');
const bot = require('./bot');
const sharp = require('sharp'); // Adiciona sharp para redimensionar imagens

let mensagemEscolhaNumerosId;
let mensagemErroId;
let mensagemSolicitacaoTelefoneId;

// Função para validar os números selecionados
function validateSelectedNumbers(ctx) {
    if (Array.isArray(ctx.session.selectedNumbers)) {
        ctx.session.selectedNumbers = ctx.session.selectedNumbers.filter(number => number !== null && !isNaN(number));
    } else {
        ctx.session.selectedNumbers = [];
    }
}

// Função para lidar com a validação do número de telefone
async function validatePhoneNumberAcumulado6(ctx) {
    ctx.session.awaitingPhoneNumberForGame = true;
    ctx.session.selectedNumbers = [];

    const salvarId = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
        caption: 'Ficaremos felizes em entrar em contato contigo, caso seja um ganhador! Para isso, digite seu número de telefone com o DDD.'
    });
    ctx.session.mensagensIDS.push(salvarId.message_id);
    mensagemSolicitacaoTelefoneId = salvarId.message_id;
}

// Função para manipular o texto do número de telefone
async function handleJogoAcumulado6Text(ctx) {
    const response = ctx.message.text.trim();

    if (isValidPhoneNumber(response) && ctx.session.awaitingPhoneNumberForGame) {
        ctx.session.userPhoneNumber = response;
        ctx.session.awaitingPhoneNumberForGame = false;
        await deleteAllMessages(ctx); // Apagar todas as mensagens anteriores
        await ctx.deleteMessage(ctx.message.message_id); // Apagar a mensagem do número de telefone digitado
        if (mensagemSolicitacaoTelefoneId) {
            await ctx.deleteMessage(mensagemSolicitacaoTelefoneId); // Apagar a mensagem solicitando o número de telefone
            mensagemSolicitacaoTelefoneId = null;
        }
        const keyboard = createNumericKeyboard(ctx, ctx.session.selectedNumbers);
        const message = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
            caption: 'Escolha seus 10 números:',
            reply_markup: { inline_keyboard: keyboard }
        });
        ctx.session.mensagensIDS.push(message.message_id);
        mensagemEscolhaNumerosId = message.message_id;
    } else if (ctx.session.awaitingPhoneNumberForGame) {
        await ctx.deleteMessage(ctx.message.message_id); // Apagar a mensagem do número de telefone digitado
        if (mensagemSolicitacaoTelefoneId) {
            await ctx.deleteMessage(mensagemSolicitacaoTelefoneId); // Apagar a mensagem solicitando o número de telefone
            mensagemSolicitacaoTelefoneId = null;
        }
        if (mensagemErroId) {
            await ctx.deleteMessage(mensagemErroId); // Apagar a mensagem de erro anterior
        }
        const salvarID3 = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
            caption: 'Número inválido. Por favor, digite um número de celular válido com 11 dígitos.',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });
        ctx.session.mensagensIDS.push(salvarID3.message_id);
        mensagemErroId = salvarID3.message_id; // Armazenar o id da nova mensagem de erro
    } else {
        apresentarTelaInicial(ctx);
    }
}

// Função para excluir o teclado numérico
async function deleteNumericKeyboard(ctx, messageId) {
    try {
        if (messageId) {
            await ctx.deleteMessage(messageId);
        }
    } catch (error) {
        console.error('Erro ao excluir o teclado numérico:', error);
    }
}

bot.action('voltar', async (ctx) => {
    await deleteAllMessages(ctx);
    if (mensagemEscolhaNumerosId) {
        await deleteNumericKeyboard(ctx, mensagemEscolhaNumerosId);
    }
    apresentarTelaInicial(ctx);
});

bot.action(/^[1-9]\d*$/, async (ctx) => {
    const number = parseInt(ctx.match[0]);
    if (!ctx.session.selectedNumbers) {
        ctx.session.selectedNumbers = [];
    }
    const index = ctx.session.selectedNumbers.indexOf(number);
    if (index === -1) {
        if (ctx.session.selectedNumbers.length >= 10) {
            if (mensagemErroId) {
                try {
                    await ctx.deleteMessage(mensagemErroId);
                } catch (error) {
                    console.error('Erro ao deletar a mensagem de erro anterior:', error);
                }
            }
            const salvarID = await ctx.reply('Já foram selecionados 10 números.');
            mensagemErroId = salvarID.message_id;
            ctx.session.mensagensIDS.push(salvarID.message_id);
            return;
        }
        ctx.session.selectedNumbers.push(number);
    } else {
        ctx.session.selectedNumbers.splice(index, 1);
    }
    const keyboardData = createNumericKeyboard(ctx, ctx.session.selectedNumbers);
    const message = ctx.callbackQuery.message;

    if (message.photo) {
        await ctx.editMessageCaption('Escolha os seus 10 números:', {
            reply_markup: { inline_keyboard: keyboardData }
        });
    } else {
        await ctx.editMessageText('Escolha os seus 10 números:', {
            reply_markup: { inline_keyboard: keyboardData }
        });
    }
});

async function handleConfirmAction(ctx) {
    validateSelectedNumbers(ctx);
    const numbersCount = ctx.session.selectedNumbers.length;
    if (numbersCount < 10) {
        if (mensagemErroId) {
            try {
                await ctx.deleteMessage(mensagemErroId);
            } catch (error) {
                console.error('Erro ao deletar a mensagem de erro anterior:', error);
            }
        }
        const salvarID = await ctx.reply(`Você escolheu apenas ${numbersCount} número(s), selecione mais ${10 - numbersCount} número(s).`);
        mensagemErroId = salvarID.message_id;
        ctx.session.mensagensIDS.push(salvarID.message_id);
        return;
    }

    if (numbersCount === 10) {
        await deleteAllMessages(ctx); // Apagar todas as mensagens anteriores
        const confirm_NumerosButton = Markup.button.callback('Confirmar Números', 'confirmar_Numeros');
        const alterar_NumerosButton = Markup.button.callback('Alterar Números', 'alterar_Numeros');
        const keyboard = [[confirm_NumerosButton, alterar_NumerosButton]];
        const salvarId = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
            caption: `Confirme os Números Selecionados: \n${ctx.session.selectedNumbers.sort((a, b) => a - b).join('  ')}`,
            reply_markup: { inline_keyboard: keyboard }
        });
        if (salvarId && salvarId.message_id) {
            ctx.session.mensagensIDS.push(salvarId.message_id);
        }
    }
}

bot.action('confirmar', handleConfirmAction);

bot.action('confirmar_Numeros', async (ctx) => {
    await deleteAllMessages(ctx);

    if (mensagemEscolhaNumerosId) {
        await deleteNumericKeyboard(ctx, mensagemEscolhaNumerosId);
        mensagemEscolhaNumerosId = null;
    }

    if (ctx.session.selectedNumbers.length === 10) {
        try {
            const qrCodeData = await gerarQRCodePix();
            if (!qrCodeData) {
                throw new Error('Falha ao gerar QR Code.');
            }

            const { id, qrCodeData: qrData, qrCodeBase64 } = qrCodeData;
            await salvarNumerosSelecionadosAcumulado6(ctx.session.selectedNumbers, ctx, qrData); // Passar o código do QR Code
            const result = await inserirIDPagamentoNaPlanilha(id, 'NumerosSelecionadosAcumulado6.xlsx');

            if (result) {
                // Redimensionar a imagem do QR code para corresponder ao tamanho da logo
                const logoImage = await sharp('Logo3.jpg').metadata();
                const qrCodeImage = await sharp(Buffer.from(qrCodeBase64, 'base64'))
                    .resize({ width: logoImage.width }) // Redimensiona a imagem do QR code para ter a mesma largura da logo
                    .toBuffer();

                // Enviar logo e primeira mensagem juntas
                const mensagemInicial = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
                    caption: `
📸 PIX Gerado com Sucesso

💰 Valor da Cota R$15,00

⏰ Este qrcode ficará válido para pagamento por 60 minutos
`
                });

                ctx.session.mensagensIDS.push(mensagemInicial.message_id);

                // Enviar a imagem do QR Code redimensionada
                const mensagemQRCode = await ctx.replyWithPhoto({ source: qrCodeImage });
                ctx.session.mensagensIDS.push(mensagemQRCode.message_id);

                // Mensagem do PIX Copia e Cola
                const mensagemPixCopiaCola = await ctx.reply('👇👇👇 PIX Copia e Cola 👇👇👇');
                ctx.session.mensagensIDS.push(mensagemPixCopiaCola.message_id);

                // Enviar código do PIX Copia e Cola para fácil cópia
                const mensagemCodigoPix = await ctx.replyWithMarkdown(`\`${qrData}\``);
                ctx.session.mensagensIDS.push(mensagemCodigoPix.message_id);

                // Botão para voltar ao menu inicial
                const voltarButton = Markup.button.callback('🏠 Menu Inicial', 'voltar');
                const mensagemVoltar = await ctx.reply('Use o botão abaixo para retornar ao menu inicial:', Markup.inlineKeyboard([[voltarButton]]));
                ctx.session.mensagensIDS.push(mensagemVoltar.message_id);

            } else {
                throw new Error('Falha ao inserir ID de pagamento na planilha.');
            }

        } catch (error) {
            console.error('Erro ao processar ação confirmar_Numeros:', error);
            const salvarId = await ctx.reply('Ocorreu um erro ao processar sua solicitação.');
            if (salvarId) {
                ctx.session.mensagensIDS.push(salvarId.message_id);
            }
        }
    } else {
        if (mensagemErroId) {
            try {
                await ctx.deleteMessage(mensagemErroId);
                mensagemErroId = null;
            } catch (error) {
                console.error('Erro ao deletar a mensagem de erro anterior:', error);
            }
        }
        const mensagemErro = await ctx.reply('Por favor, selecione exatamente 10 números antes de confirmar.');
        mensagemErroId = mensagemErro.message_id;
        ctx.session.mensagensIDS.push(mensagemErro.message_id);
    }
});

// Adiciona ação para o botão de alterar números
bot.action('alterar_Numeros', async (ctx) => {
    if (mensagemErroId) {
        try {
            await ctx.deleteMessage(mensagemErroId);
            mensagemErroId = null;
        } catch (error) {
            console.error('Erro ao deletar a mensagem de erro anterior:', error);
        }
    }
    const keyboardData = createNumericKeyboard(ctx, ctx.session.selectedNumbers);
    await ctx.editMessageCaption('Escolha os seus 10 números:', {
        reply_markup: { inline_keyboard: keyboardData }
    });
});

module.exports = {
    validatePhoneNumberAcumulado6,
    handleJogoAcumulado6Text,
    bot
};
