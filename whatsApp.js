const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const axios = require('axios');
require('dotenv').config(); // Para carregar a API_KEY do ChatGPT do arquivo .env

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

async function getChatGPTResponse(message) {
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        {
            prompt: `Usuário: ${message}\nChatGPT:`,
            max_tokens: 150,
            temperature: 0.7,
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.choices[0].text.trim();
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    let conn;

    async function initializeConnection() {
        conn = makeWASocket({
            auth: state,
            printQRInTerminal: true
        });

        conn.ev.on('creds.update', saveCreds);

        conn.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                console.log('QR code recebido, escaneie com seu aplicativo WhatsApp:', qr);
            }
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error instanceof Boom) ?
                    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
                console.log('Conexão perdida devido a', lastDisconnect.error, ', tentando reconectar...', shouldReconnect);
                if (shouldReconnect) {
                    setTimeout(initializeConnection, 5000);
                }
            } else if (connection === 'open') {
                console.log('Conectado ao WhatsApp');
            }
        });

        conn.ev.on('messages.upsert', async (m) => {
            const message = m.messages[0];
            const isGroupMessage = message.key.remoteJid.endsWith('@g.us');
            const isBroadcastMessage = message.key.remoteJid === 'status@broadcast';

            if (!message.key.fromMe && !isGroupMessage && !isBroadcastMessage && m.type === 'notify') {
                console.log('Respondendo para', message.key.remoteJid);
                const chatGPTResponse = await getChatGPTResponse(message.message.conversation);
                await conn.sendMessage(message.key.remoteJid, { text: chatGPTResponse });
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

async function enviarMensagemWhatsApp(numero, mensagem) {
    const conn = await waConnPromise;
    const id = formatPhoneNumber(numero) + '@s.whatsapp.net';

    await conn.sendPresenceUpdate('composing', id);
    const typingDuration = Math.floor(Math.random() * 10000) + 5000;
    await sleep(typingDuration);
    await conn.sendPresenceUpdate('paused', id);

    const delay = Math.floor(Math.random() * 15000) + 10000;
    await sleep(delay);

    await conn.sendMessage(id, { text: mensagem });
    console.log(`Mensagem enviada para ${numero} no WhatsApp`);
}

module.exports = {
    connectToWhatsApp,
    enviarMensagemWhatsApp,
    formatPhoneNumber
};
