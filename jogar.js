const { Markup } = require('telegraf');
const path = require('path');
const { mensagensIDS, deleteAllMessages } = require('./telaInicial');
const fs = require('fs');

let isSending = false;

// Função para apresentar o submenu "Acerto Acumulado6"
async function apresentarSubMenuAcertoAcumulado6(ctx) {
    await apresentarSubMenu(ctx, 'Acerto Acumulado 6', 'acumulado6');
}

// Função para apresentar o submenu "Acerto Acumulado10"
async function apresentarSubMenuAcertoAcumulado10(ctx) {
    await apresentarSubMenu(ctx, 'Acerto Acumulado 10', 'acumulado10');
}

// Função para apresentar o submenu "Tiro Certo"
async function apresentarSubMenuTiroCerto(ctx) {
    await apresentarSubMenu(ctx, 'Tiro Certo', 'tiro_certo');
}

// Função genérica para apresentar submenus
async function apresentarSubMenu(ctx, titulo, modalidade) {
    if (ctx.callbackQuery) {
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
        await ctx.editMessageCaption(`Selecione uma opção para ${titulo}:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🏁 Participar do Jogo', callback_data: `participar_jogo_${modalidade}` }],
                    [{ text: '🏆 Premiações', callback_data: `premiacoes_${modalidade}` }],
                    [{ text: '🧍‍♂️🧍‍♀️🧍 Planilha de Jogadores', callback_data: `planilha_jogadores_${modalidade}` }],
                    [{ text: '🎮 Menu Anterior', callback_data: 'menu_jogar' }],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });
    } else {
        apresentarTelaInicial(ctx);
    }
}

// Função para simular uma barra de carregamento visual com cores
async function carregarBarraProgressoVisual(ctx, totalSteps = 10, delay = 400) {
    const fullBlock = '🟩'; // Bloco preenchido (verde)
    const emptyBlock = '⬜'; // Bloco vazio (branco)
    let message;
    
    for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        const progress = Math.floor((i / totalSteps) * 100);
        const progressBar = `[${fullBlock.repeat(i)}${emptyBlock.repeat(totalSteps - i)}] ${progress}%`;
        if (i === 1) {
            message = await ctx.reply(`Carregando... \n ${progressBar}`);
        } else {
            await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, null, `Carregando... \n ${progressBar}`);
        }
    }
    return message;
}

// Função genérica para apresentar arquivos PDF
async function apresentarArquivoPDF(ctx, modalidade, tipo) {
    if (isSending) return;
    isSending = true;
    let progressMessage;
    const originalMarkup = ctx.callbackQuery.message.reply_markup;
    try {
        const arquivoPath = path.join(__dirname, `${tipo}${modalidade}.pdf`);

        // Bloquear botões durante o carregamento
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

        // Simula barra de progresso antes de enviar o arquivo
        progressMessage = await carregarBarraProgressoVisual(ctx);

        // Envia o arquivo PDF
        const salvarId = await ctx.replyWithDocument({ source: arquivoPath });

        // Se o arquivo foi enviado corretamente, agenda sua exclusão após 6 segundos
        if (salvarId) {
            ctx.session.mensagensIDS.push(salvarId.message_id);

            setTimeout(async () => {
                try {
                    await ctx.deleteMessage(salvarId.message_id); // Apaga o arquivo da tela do cliente
                } catch (error) {
                    console.error(`Erro ao deletar a mensagem do arquivo enviado:`, error);
                }
            }, 6000);
        } else {
            throw new Error('Erro ao enviar o arquivo.');
        }
    } catch (error) {
        console.error(`Erro ao enviar o arquivo PDF de ${tipo} para ${modalidade}:`, error);
        await ctx.reply('Desculpe, houve um erro ao enviar o arquivo.');
    } finally {
        isSending = false;
        if (progressMessage) {
            try {
                await ctx.deleteMessage(progressMessage.message_id);
            } catch (error) {
                console.error(`Erro ao deletar a mensagem de carregamento:`, error);
            }
        }
        // Restaurar os botões após o envio
        await ctx.editMessageReplyMarkup(originalMarkup);
    }
}

// Função para apresentar as premiações
async function apresentarPremiacoes(ctx, modalidade) {
    await apresentarArquivoPDF(ctx, modalidade, 'Premiacoes');
}

// Função para apresentar a planilha de jogadores
async function apresentarPlanilhaJogadores(ctx, modalidade) {
    await apresentarArquivoPDF(ctx, modalidade, 'PlanilhaJogadores');
}

// Exporta as funções para serem usadas em outros módulos
module.exports = {
    apresentarSubMenuAcertoAcumulado6,
    apresentarSubMenuAcertoAcumulado10,
    apresentarSubMenuTiroCerto,
    apresentarPremiacoes,
    apresentarPlanilhaJogadores,
    mensagensIDS
};
