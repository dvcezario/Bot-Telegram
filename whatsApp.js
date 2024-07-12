// whatsApp.js

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
require('dotenv').config(); // Para carregar a API_KEY do ChatGPT do arquivo .env

// Função para garantir que um arquivo JSON exista e esteja inicializado
function ensureJsonFileExists(filePath, initialData) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    } else {
        try {
            JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
        }
    }
}

// Inicializar arquivos JSON se não existirem ou estiverem vazios/corrompidos
ensureJsonFileExists('usuarios.json', { usuarios: [] });

// Função para formatar números de telefone
function formatPhoneNumber(phoneNumber) {
    let numeroFormatado = phoneNumber.replace(/\D/g, '');
    if (numeroFormatado.startsWith('55') && numeroFormatado.length > 13) {
        numeroFormatado = numeroFormatado.slice(2);
    }
    if (!numeroFormatado.startsWith('55')) {
        numeroFormatado = '55' + numeroFormatado;
    }
    if (numeroFormatado.length === 13 && numeroFormatado.startsWith('55')) {
        numeroFormatado = numeroFormatado.slice(0, 4) + numeroFormatado.slice(5);
    }
    return numeroFormatado;
}

// Função para determinar a saudação baseada no horário
function getSaudacao() {
    const horaAtual = new Date().getHours();
    if (horaAtual < 12) {
        return "Bom dia";
    } else if (horaAtual < 18) {
        return "Boa tarde";
    } else {
        return "Boa noite";
    }
}

// Função para enviar mensagem de boas-vindas
async function enviarMensagemBoasVindas(conn, numero, nomeUsuario = "") {
    const saudacao = getSaudacao();
    const mensagem = `${saudacao}, ${nomeUsuario}! Bem-vindo(a) ao Década da Sorte! Estamos entusiasmados com sua participação. Se surgir alguma dúvida sobre o jogo, estamos aqui para ajudar. Desejamos muita sorte e diversão!`;
    await conn.sendMessage(numero, { text: mensagem });
    console.log(`📨 Mensagem de boas-vindas enviada para ${numero}`);
}

// Função para rastrear usuários que receberam a mensagem de boas-vindas
function rastrearUsuario(numero) {
    const usuarios = JSON.parse(fs.readFileSync('usuarios.json', 'utf8'));
    if (!usuarios.usuarios.includes(numero)) {
        usuarios.usuarios.push(numero);
        fs.writeFileSync('usuarios.json', JSON.stringify(usuarios, null, 2));
        return true;
    }
    return false;
}

// Função para resetar o estado de autenticação
function resetAuthState() {
    const authDir = 'auth_info_baileys';
    if (fs.existsSync(authDir)) {
        fs.rmdirSync(authDir, { recursive: true });
    }
}

// Função para conectar ao WhatsApp
async function connectToWhatsApp() {
    let { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    let conn;

    async function initializeConnection() {
        conn = makeWASocket({
            auth: state,
            printQRInTerminal: true
        });

        conn.ev.on('creds.update', saveCreds);

        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                console.log('📲 QR code recebido, escaneie com seu aplicativo WhatsApp:', qr);
            }
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error instanceof Boom) ?
                    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
                console.log('❌ Conexão perdida devido a', lastDisconnect.error, ', tentando reconectar...', shouldReconnect);
                if (lastDisconnect.error.output.statusCode === DisconnectReason.loggedOut) {
                    console.log('🛑 Usuário deslogado, resetando estado de autenticação.');
                    resetAuthState();
                    // Resetar estado e reiniciar conexão
                    const newState = await useMultiFileAuthState('auth_info_baileys');
                    state = newState.state;
                    saveCreds = newState.saveCreds;
                    setTimeout(initializeConnection, 5000);
                } else if (shouldReconnect) {
                    setTimeout(initializeConnection, 5000);
                }
            } else if (connection === 'open') {
                console.log('✅ Conectado ao WhatsApp');
            }
        });

        conn.ev.on('messages.upsert', async (m) => {
            const message = m.messages[0];
            const isGroupMessage = message.key.remoteJid.endsWith('@g.us');
            const isBroadcastMessage = message.key.remoteJid === 'status@broadcast';

            if (!message.key.fromMe && !isGroupMessage && !isBroadcastMessage && m.type === 'notify') {
                console.log('💬 Respondendo para', message.key.remoteJid);
                const numero = message.key.remoteJid;

                let nomeUsuario = message.pushName || "";
                if (rastrearUsuario(numero)) {
                    await enviarMensagemBoasVindas(conn, numero, nomeUsuario);
                }
            }
        });
    }

    await initializeConnection();
    return conn;
}

const waConnPromise = connectToWhatsApp();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para enviar mensagem no WhatsApp
async function enviarMensagemWhatsApp(numero, mensagem) {
    try {
        const conn = await waConnPromise;
        const id = formatPhoneNumber(numero) + '@s.whatsapp.net';

        console.log(`📝 Enviando mensagem para ${numero} (ID: ${id})...`);
        await conn.sendPresenceUpdate('composing', id);
        const typingDuration = Math.floor(Math.random() * 10000) + 5000;
        await sleep(typingDuration);
        await conn.sendPresenceUpdate('paused', id);

        const delay = Math.floor(Math.random() * 15000) + 10000;
        await sleep(delay);

        await conn.sendMessage(id, { text: mensagem });
        console.log(`📨 Mensagem enviada para ${numero} no WhatsApp`);
    } catch (error) {
        console.error(`Erro ao enviar mensagem para ${numero} no WhatsApp:`, error);
    }
}

module.exports = {
    connectToWhatsApp,
    enviarMensagemWhatsApp,
    formatPhoneNumber
};
