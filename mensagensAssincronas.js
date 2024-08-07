// mensagensAssincronas.js

const xlsx = require('xlsx');
const bot = require('./bot');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const { waitForLock } = require('./utils');
const { enviarMensagemWhatsApp } = require('./whatsApp');

const sentMessages = new Set(); // Conjunto para armazenar IDs das mensagens enviadas

/**
 * Função para formatar o número de telefone para WhatsApp.
 * @param {string} numero - Número de telefone a ser formatado.
 * @returns {string} - Número de telefone formatado.
 */
function formatarNumeroWhatsApp(numero) {
    let numeroFormatado = numero.replace(/\D/g, '');
    if (numeroFormatado.length === 13) {
        numeroFormatado = numeroFormatado.slice(0, 2) + numeroFormatado.slice(3);
    }
    return numeroFormatado;
}

/**
 * Função para criar ou atualizar a planilha todosJogadores.
 */
async function atualizarPlanilhaJogadores() {
    console.log('Executando atualizarPlanilhaJogadores...');
    const filePath = path.join(__dirname, 'todosJogadores.xlsx');
    const novosJogadoresFile = path.join(__dirname, 'NumerosSelecionadosAcumulado6.xlsx');

    if (!fs.existsSync(novosJogadoresFile)) {
        console.error('Arquivo NumerosSelecionadosAcumulado6 não encontrado.');
        return;
    }

    let release;
    try {
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        let workbook;
        let jogadoresSheet;

        if (!fs.existsSync(filePath)) {
            console.log('Arquivo todosJogadores.xlsx não encontrado. Criando novo workbook...');
            workbook = xlsx.utils.book_new();
            jogadoresSheet = xlsx.utils.aoa_to_sheet([['Nome', 'ID', 'Telefone']]);
            xlsx.utils.book_append_sheet(workbook, jogadoresSheet, 'todosJogadores');
            xlsx.writeFile(workbook, filePath);
        }

        release = await waitForLock(filePath);

        workbook = xlsx.readFile(filePath);
        jogadoresSheet = workbook.Sheets['todosJogadores'];

        const jogadores = xlsx.utils.sheet_to_json(jogadoresSheet);
        const idsExistentes = new Set(jogadores.map(jogador => jogador.ID));

        const novosWorkbook = xlsx.readFile(novosJogadoresFile);
        const novosWorksheet = novosWorkbook.Sheets['NumerosSelecionadosAcumulado6'];
        const novosDados = xlsx.utils.sheet_to_json(novosWorksheet);

        novosDados.forEach(novoJogador => {
            if (!idsExistentes.has(novoJogador.ID)) {
                jogadores.push({
                    Nome: novoJogador.Nome,
                    ID: novoJogador.ID,
                    Telefone: novoJogador.Telefone
                });
            }
        });

        jogadores.sort((a, b) => a.Nome.localeCompare(b.Nome));

        jogadoresSheet = xlsx.utils.json_to_sheet(jogadores, { header: ['Nome', 'ID', 'Telefone'] });
        workbook.Sheets['todosJogadores'] = jogadoresSheet;

        xlsx.writeFile(workbook, filePath);
        console.log('Planilha todosJogadores atualizada.');
    } catch (error) {
        console.error('Erro ao atualizar a planilha:', error);
    } finally {
        if (release) {
            await release();
        }
    }
}

// Agendar a função para rodar todos os dias às 3 da manhã
cron.schedule('0 3 * * *', () => {
    console.log('Executando tarefa cron de atualização da planilha de jogadores.');
    atualizarPlanilhaJogadores();
});

/**
 * Função para enviar mensagem sobre pagamento pendente.
 */
async function enviarMensagemPagamentoPendente() {
    console.log('Executando enviarMensagemPagamentoPendente...');
    const fileName = path.join(__dirname, 'NumerosSelecionadosAcumulado6.xlsx');

    if (!fs.existsSync(fileName)) {
        console.error('Arquivo da planilha não encontrado.');
        return;
    }

    let release;
    try {
        release = await waitForLock(fileName);

        const workbook = xlsx.readFile(fileName);
        const worksheet = workbook.Sheets['NumerosSelecionadosAcumulado6'];
        const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const nomeUsuario = row[0]; // Primeira coluna: Nome do usuário
            const telegramId = row[1]; // Segunda coluna: ID do usuário no Telegram
            let numeroWhatsApp = row[2]; // Terceira coluna: Número de WhatsApp
            const pagamento = row[16]; // Coluna 17: Pagamento
            const dataCriacao = row[4]; // Coluna 5: Data de criação
            const horarioCriacao = row[5]; // Coluna 6: Horário de criação
            const qrCode = row[17]; // Coluna 18: QR Code Copia e Cola
            const idPagamento = row[3]; // Coluna 4: ID do pagamento
            const numerosEscolhidos = row.slice(6, 16).join(' '); // Colunas 7 a 16: Números escolhidos

            if (!dataCriacao || !horarioCriacao || typeof pagamento !== 'string') {
                console.warn(`Dados de criação inválidos para a linha ${i}`);
                continue;
            }

            const dataParts = dataCriacao.split('/');
            const horaParts = horarioCriacao.split(':');

            if (dataParts.length !== 3 || horaParts.length !== 2) {
                console.warn(`Formato de data ou horário inválido para a linha ${i}`);
                continue;
            }

            const [dia, mes, ano] = dataParts;
            const [hora, minuto] = horaParts;
            const dataHoraCriacao = new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}:00`);

            // Verifica se o QR code ainda está válido (60 minutos)
            const agora = new Date();
            const diffMinutes = (agora - dataHoraCriacao) / 1000 / 60;

            if (pagamento.toLowerCase() === 'não') {
                let tempoRestante = null;

                if (diffMinutes >= 1 && diffMinutes < 5) {
                    tempoRestante = 58;
                } else if (diffMinutes >= 30 && diffMinutes < 35) {
                    tempoRestante = 30;
                } else if (diffMinutes >= 55 && diffMinutes < 60) {
                    tempoRestante = 5;
                }

                if (tempoRestante !== null && !sentMessages.has(`${telegramId}-${tempoRestante}`)) {
                    const mensagem = `Olá ${nomeUsuario}, faltam apenas ${tempoRestante} minutos para realizar o pagamento da cota de número ${idPagamento}, onde os números escolhidos foram ${numerosEscolhidos}, caso contrário, o QR Code expirará. Não perca a chance! Realize o pagamento agora para garantir sua participação.\n\n👇👇QR Code Copia e Cola:👇👇`;

                    try {
                        const message = await bot.telegram.sendMessage(telegramId, mensagem);
                        console.log(`Mensagem enviada para ${nomeUsuario} (${telegramId}) sobre pagamento pendente.`);
                        
                        sentMessages.add(`${telegramId}-${tempoRestante}`); // Marcar como enviada

                        const qrMessage = await bot.telegram.sendMessage(telegramId, qrCode);
                        console.log(`Mensagem de QR Code Copia e Cola enviada para ${nomeUsuario} (${telegramId}).`);

                        // Agendar a exclusão das mensagens após 10 minutos
                        setTimeout(async () => {
                            try {
                                await bot.telegram.deleteMessage(telegramId, message.message_id);
                                console.log(`Mensagem de pagamento pendente deletada para ${nomeUsuario} (${telegramId}).`);

                                await bot.telegram.deleteMessage(telegramId, qrMessage.message_id);
                                console.log(`Mensagem de QR Code Copia e Cola deletada para ${nomeUsuario} (${telegramId}).`);
                            } catch (error) {
                                console.error(`Erro ao deletar mensagem de pagamento pendente para ${nomeUsuario} (${telegramId}):`, error);
                            }
                        }, 10 * 60 * 1000); // 10 minutos

                        if (numeroWhatsApp) {
                            numeroWhatsApp = formatarNumeroWhatsApp(numeroWhatsApp); // Formatar número para WhatsApp
                            console.log(`Enviando mensagem para ${numeroWhatsApp} no WhatsApp: ${mensagem}`);
                            await enviarMensagemWhatsApp(numeroWhatsApp, mensagem);
                            console.log(`Enviando QR code para ${numeroWhatsApp} no WhatsApp: ${qrCode}`);
                            await enviarMensagemWhatsApp(numeroWhatsApp, qrCode); // Enviar QR code no WhatsApp
                        }
                    } catch (error) {
                        console.error(`Erro ao enviar mensagem para ${nomeUsuario} (${telegramId}):`, error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro ao ler a planilha ou enviar mensagens:', error);
    } finally {
        if (release) {
            await release();
        }
    }
}

/**
 * Função para enviar mensagem de confirmação de pagamento.
 * @param {string} nomeUsuario - Nome do usuário.
 * @param {number} telegramId - ID do usuário no Telegram.
 * @param {string} numeroWhatsApp - Número de WhatsApp do usuário.
 */
async function enviarMensagemConfirmacaoPagamento(nomeUsuario, telegramId, numeroWhatsApp) {
    const mensagem = `Olá ${nomeUsuario}, seu pagamento foi confirmado com sucesso! Boa sorte!`;

    try {
        const message = await bot.telegram.sendMessage(telegramId, mensagem);
        console.log(`Mensagem de confirmação de pagamento enviada para ${nomeUsuario} (${telegramId}).`);

        // Agendar a exclusão da mensagem após 10 minutos
        setTimeout(async () => {
            try {
                await bot.telegram.deleteMessage(telegramId, message.message_id);
                console.log(`Mensagem de confirmação de pagamento deletada para ${nomeUsuario} (${telegramId}).`);
            } catch (error) {
                console.error(`Erro ao deletar mensagem de confirmação de pagamento para ${nomeUsuario} (${telegramId}):`, error);
            }
        }, 10 * 60 * 1000); // 10 minutos

        if (numeroWhatsApp) {
            numeroWhatsApp = formatarNumeroWhatsApp(numeroWhatsApp); // Formatar número para WhatsApp
            await enviarMensagemWhatsApp(numeroWhatsApp, mensagem);
        }
    } catch (error) {
        console.error(`Erro ao enviar mensagem de confirmação de pagamento para ${nomeUsuario} (${telegramId}):`, error);
    }
}

/**
 * Função para enviar mensagem de lembrete para o dia do sorteio.
 */
function enviarLembreteSorteio() {
    // Lógica para enviar mensagem de lembrete para o dia do sorteio
    console.log('Enviando lembrete para o dia do sorteio...');
}

/**
 * Função para enviar mensagem de lembrete para o dia de início da rodada.
 */
function enviarLembreteInicioRodada() {
    // Lógica para enviar mensagem de lembrete para o dia de início da rodada
    console.log('Enviando lembrete para o dia de início da rodada...');
}

// Agendar envio de mensagens a cada minuto para garantir os lembretes nos tempos corretos
cron.schedule('* * * * *', enviarMensagemPagamentoPendente);

module.exports = {
    enviarLembreteSorteio,
    enviarLembreteInicioRodada,
    enviarMensagemPagamentoPendente,
    enviarMensagemConfirmacaoPagamento,
    atualizarPlanilhaJogadores
};
