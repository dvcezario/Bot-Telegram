const TelegramBot = require('node-telegram-bot-api');
const QRCode = require('qrcode');
const fs = require('fs');

// Token do seu bot do Telegram
const token = '6828499806:AAEi1hcYkbX1u2qdq-d0CgmhWno3_5_rurE';

// Inicialize o bot do Telegram
const bot = new TelegramBot(token, { polling: true });

// Evento de escuta para mensagens recebidas
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Verifica se a mensagem recebida é um comando /qrcode
    if (msg.text === '/qrcode') {
        try {
            // Dados para o QR code
            const qrcodedata = '00020126360014br.gov.bcb.pix0114+553199114286252040000530398654040.015802BR5918DEGI202403241701566009Sao Paulo62240520mpqrinter760879836336304328F';

            // Gere o QR code como uma imagem
            const qrImagePath = 'qrcode.png';
            await generateQRCode(qrcodedata, qrImagePath);

            // Envie a imagem do QR code para o usuário
            await bot.sendPhoto(chatId, qrImagePath);

            // Remova a imagem temporária do QR code
            fs.unlinkSync(qrImagePath);
        } catch (error) {
            console.error('Erro ao gerar e enviar QR code:', error);
        }
    }
});

// Evento de escuta para o bot ser iniciado
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        // Dados para o QR code
        const qrcodedata = '00020126360014br.gov.bcb.pix0114+553199114286252040000530398654040.015802BR5918DEGI202403241701566009Sao Paulo62240520mpqrinter760879836336304328F';

        // Gere o QR code como uma imagem
        const qrImagePath = 'qrcode.png';
        await generateQRCode(qrcodedata, qrImagePath);

        // Envie a imagem do QR code para o usuário
        await bot.sendPhoto(chatId, qrImagePath);

        // Remova a imagem temporária do QR code
        fs.unlinkSync(qrImagePath);
    } catch (error) {
        console.error('Erro ao gerar e enviar QR code:', error);
    }
});

// Função para gerar o QR code como uma imagem
async function generateQRCode(qrcodedata, outputPath) {
    try {
        await QRCode.toFile(outputPath, qrcodedata);
        console.log('QR code gerado com sucesso:', outputPath);
    } catch (error) {
        console.error('Erro ao gerar QR code:', error);
        throw error;
    }
}
