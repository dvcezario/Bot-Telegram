// jogar.js

const { Markup } = require('telegraf');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { dia, mes, ano } = require('./config');
const { mensagensIDS, deleteAllMessages } = require('./telaInicial');

let isSending = false;

/**
 * Função para apresentar o submenu "Acerto Acumulado 6".
 * @param {Object} ctx - Contexto do Telegraf.
 */
async function apresentarSubMenuAcertoAcumulado6(ctx) {
    await apresentarSubMenu(ctx, 'Acerto Acumulado 6', 'acumulado6');
}

/**
 * Função para apresentar o submenu "Acerto Acumulado 10".
 * @param {Object} ctx - Contexto do Telegraf.
 */
async function apresentarSubMenuAcumulado10(ctx) {
    await apresentarSubMenu(ctx, 'Acerto Acumulado 10', 'acumulado10');
}

/**
 * Função para apresentar o submenu "Tiro Certo".
 * @param {Object} ctx - Contexto do Telegraf.
 */
async function apresentarSubMenuTiroCerto(ctx) {
    await apresentarSubMenu(ctx, 'Tiro Certo', 'tiro_certo');
}

/**
 * Função genérica para apresentar submenus.
 * @param {Object} ctx - Contexto do Telegraf.
 * @param {string} titulo - Título do submenu.
 * @param {string} modalidade - Modalidade do jogo.
 */
async function apresentarSubMenu(ctx, titulo, modalidade) {
    if (ctx.callbackQuery) {
        ctx.session.mensagensIDS.push(ctx.callbackQuery.message.message_id);
        await ctx.editMessageCaption(`🎮 Selecione uma opção para ${titulo}:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🏁 Participar do Jogo', callback_data: `participar_jogo_${modalidade}` }],
                    [{ text: '🏆 Premiações', callback_data: `premiacoes_${modalidade}` }],
                    [{ text: '🧍‍♂️🧍‍♀️🧍 Planilha de Jogadores', callback_data: `planilha_jogadores_${modalidade}` }],
                    [{ text: '🎮 Menu Anterior', callback_data: `sub_menu_${modalidade}` }],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });
    } else {
        apresentarTelaInicial(ctx);
    }
}

/**
 * Função para apresentar as premiações.
 * @param {Object} ctx - Contexto do Telegraf.
 * @param {string} modalidade - Modalidade do jogo.
 */
async function apresentarPremiacoes(ctx, modalidade) {
    await deleteAllMessages(ctx);

    const dataFormatada = `${dia} de ${mes} de ${ano}`;
    const filePath = path.join(__dirname, `NumerosSelecionados${modalidade}.xlsx`);

    if (!fs.existsSync(filePath)) {
        const mensagem = 'Ainda não temos nenhum jogador participando dessa modalidade, faça seu jogo e seja o primeiro.';
        const salvarId = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
            caption: mensagem,
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🎮 Menu Anterior', callback_data: `sub_menu_${modalidade}` }],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });

        if (salvarId && salvarId.message_id) {
            ctx.session.mensagensIDS.push(salvarId.message_id);
        }

        return;
    }

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const numeroJogadores = data.filter(row => row['Pagamento'] === 'Sim').length;
    const valorArrecadadoBruto = numeroJogadores * 15;
    const valorArrecadadoLiquido = Math.ceil(valorArrecadadoBruto * 0.8);

    const premioPrincipal = Math.ceil(valorArrecadadoLiquido * 0.7);
    const premioConsolacao = Math.ceil(valorArrecadadoLiquido * 0.1);
    const premioRodada1 = Math.ceil(valorArrecadadoLiquido * 0.0667);
    const premioRodada2 = Math.ceil(valorArrecadadoLiquido * 0.0667);
    const premioRodada3 = Math.ceil(valorArrecadadoLiquido * 0.0667);

    const formatarValor = valor => valor.toFixed(2).replace('.00', ',00');

    const mensagem = `
🏆 Informações do Jogo - ${modalidade} 🏆

📅 Data de Início: ${dataFormatada}

👥 Número de Jogadores: ${numeroJogadores}
💰 Valor Arrecadado: R$ ${formatarValor(valorArrecadadoLiquido)}

🏅 Prêmio Principal: R$ ${formatarValor(premioPrincipal)}
🎖️ Prêmio Consolação: R$ ${formatarValor(premioConsolacao)}
🥇 Prêmio 1ª Rodada: R$ ${formatarValor(premioRodada1)}
🥈 Prêmio 2ª Rodada: R$ ${formatarValor(premioRodada2)}
🥉 Prêmio 3ª Rodada: R$ ${formatarValor(premioRodada3)}
    `;

    try {
        const salvarId = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
            caption: mensagem,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🎮 Menu Anterior', callback_data: `sub_menu_${modalidade}` }],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });

        if (salvarId && salvarId.message_id) {
            ctx.session.mensagensIDS.push(salvarId.message_id);
        }

        console.log(`📨 Informações do jogo enviadas para o usuário`);
    } catch (error) {
        console.error('Erro ao enviar informações do jogo:', error);
    }
}

/**
 * Função para apresentar a planilha de jogadores.
 * @param {Object} ctx - Contexto do Telegraf.
 * @param {string} modalidade - Modalidade do jogo.
 */
async function apresentarPlanilhaJogadores(ctx, modalidade) {
    await deleteAllMessages(ctx);

    const filePath = path.join(__dirname, `NumerosSelecionados${modalidade}.xlsx`);

    if (!fs.existsSync(filePath)) {
        const mensagem = 'Ainda não temos nenhum jogador participando dessa modalidade, faça seu jogo e seja o primeiro.';
        const salvarId = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
            caption: mensagem,
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🎮 Menu Anterior', callback_data: `sub_menu_${modalidade}` }],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });

        if (salvarId && salvarId.message_id) {
            ctx.session.mensagensIDS.push(salvarId.message_id);
        }

        return;
    }

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const jogadoresPagos = data.filter(row => row['Pagamento'] === 'Sim');

    let tabelaJogadores = '📋 *Jogadores e Números Escolhidos* 📋\n\n';
    jogadoresPagos.forEach(jogador => {
        const numerosEscolhidos = Object.keys(jogador)
            .filter((key, index) => index >= 6 && index <= 15)
            .map(key => jogador[key])
            .join(' ');

        tabelaJogadores += `👤 *${jogador.Nome}*\n${numerosEscolhidos}\n\n`;
    });

    try {
        const salvarId = await ctx.replyWithPhoto({ source: 'Logo3.jpg' }, {
            caption: tabelaJogadores,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🎮 Menu Anterior', callback_data: `sub_menu_${modalidade}` }],
                    [{ text: '🏠 Menu Inicial', callback_data: 'voltar' }]
                ]
            }
        });

        if (salvarId && salvarId.message_id) {
            ctx.session.mensagensIDS.push(salvarId.message_id);
        }

        console.log(`📨 Tabela de jogadores enviada para o usuário`);
    } catch (error) {
        console.error('Erro ao enviar a tabela de jogadores:', error);
    }
}

// Exporta as funções para serem usadas em outros módulos
module.exports = {
    apresentarSubMenuAcertoAcumulado6,
    apresentarSubMenuAcumulado10,
    apresentarSubMenuTiroCerto,
    apresentarPremiacoes,
    apresentarPlanilhaJogadores,
    mensagensIDS
};
