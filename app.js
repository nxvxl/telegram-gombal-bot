/** Import 3rd party modules */
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const packageInfo = require('./package.json');

/** Load environment variables from .env */
dotenv.config();
const token = process.env.TOKEN;

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

const botBuilder = {
  development: (token) => {
    return new TelegramBot(token, {
      polling: true
    });
  },
  production: (token) => {
    const bot = new Bot(token);
    bot.setWebHook(process.env.HEROKU_URL + bot.token);
    return bot;
  }
}
/** Initiate telegram bot */
const bot = botBuilder[process.env.NODE_ENV](token)

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

/** Express */
const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({
    name: packageInfo.name,
    version: packageInfo.version
  });
});

app.post(`/${bot.token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
  console.log(`Web server listening on PORT ${process.env.PORT}`);
});