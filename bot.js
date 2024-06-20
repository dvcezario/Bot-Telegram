// bot.js

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa as bibliotecas necessárias
const { Telegraf } = require('telegraf');
const RedisSession = require('telegraf-session-redis');

// Cria uma nova instância do bot do Telegram
const bot = new Telegraf(process.env.token);

// Configura a sessão do Redis
const session = new RedisSession({
    store: {
        host: process.env.REDIS_HOST || '127.0.0.1', // Host do Redis
        port: process.env.REDIS_PORT || 6379 // Porta do Redis
    }
});

// Usa o middleware de sessão do Redis no bot
bot.use(session.middleware());

// Exporta a instância do bot para ser usada em outros módulos
module.exports = bot;
