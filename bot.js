// bot.js

const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.token);

module.exports = bot;