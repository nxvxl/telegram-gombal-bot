/** Import 3rd party modules */
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const fs = require('fs');
const { MongoClient } = require('mongodb');

/** Load environment variables from .env */
dotenv.config();

/** Connect to database */
const client = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/** load the words */
const phrases = [
  ...JSON.parse(fs.readFileSync('./gombalan.json')),
  ...JSON.parse(fs.readFileSync('./phrases.json'))
];


/** Initiate telegram bot */
const bot = new TelegramBot(process.env.TOKEN, {
  polling: true
});

/** Reply for gombalin or /gombalin */
bot.onText(/^\/?gombalin$/, (msg, match) => {
  const chatId = msg.chat.id;
  const i = Math.floor(Math.random() * phrases.length);
  const resp = phrases[i];
  bot.sendMessage(chatId, resp);
})

bot.onText(/^\/?gombalin\s([0-9]+)$/, (msg, match) => {
  const chatId = msg.chat.id;
  for (j = 0; j < match[1]; j++) {
    const i = Math.floor(Math.random() * phrases.length);
    const resp = phrases[i];
    bot.sendMessage(chatId, resp);
  }
})

bot.onText(/^\/start$/, msg => {
  const chatId = msg.chat.id;
  client
    .connect()
    .then(async db => {
      const user = await db.db('telegrambot').collection('user').findOne({ id: msg.from.id })
      if (!user) await db.db('telegrambot').collection('user').insertOne(msg.from);        
      bot.sendMessage(chatId, 'Hello. Thanks for adding me!\nPlease write /gombalin to get love quote');
    })
    .catch(err => {
      bot.sendMessage(chatId, 'Something went wrong :(');
    })
});

bot.on('message', msg => {
  client
    .connect()
    .then(async db => {
       await db.db('telegrambot').collection('msg').insertOne(msg);
    })
    .catch(err => {
      console.log({ err });
    });
});