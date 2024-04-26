// bot.js
require('dotenv').config();
const { Telegraf } = require('telegraf');
const RedisSession = require('telegraf-session-redis');

const bot = new Telegraf(process.env.TOKEN);

// Configure Redis session
const session = new RedisSession({
    store: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379
    }
});

// Use Redis session as middleware
bot.use(session.middleware());

module.exports = bot;