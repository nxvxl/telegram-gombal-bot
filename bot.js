const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const connectDb = require('./db');
let db;

const token = process.env.TOKEN;

connectDb().then(client => db = client)

/** load the words */
const phrases = [
  ...JSON.parse(fs.readFileSync('./gombalan.json')),
  ...JSON.parse(fs.readFileSync('./phrases.json')),
];

const jawa = [
  ...JSON.parse(fs.readFileSync('./phrases/jawa.json'))
]

const randomWords = () => phrases[Math.floor(Math.random() * phrases.length)];

const botBuilder = {
  development: (token) => {
    return new TelegramBot(token, {
      polling: true,
    });
  },
  production: (token) => {
    const bot = new TelegramBot(token);
    bot.setWebHook(process.env.HEROKU_URL + bot.token);
    return bot;
  },
};
/** Initiate telegram bot */
const bot = botBuilder[process.env.NODE_ENV](token);

/** Reply for gombalin or /gombalin */
bot.onText(/^\/?gombal([ai]n)?$/, (msg) => {
  bot.sendMessage(msg.chat.id, randomWords());
});

bot.onText(/^\/?gombalin\s([0-9]+)$/, (msg, match) => {
  const chatId = msg.chat.id;
  for (j = 0; j < match[1]; j++) {
    bot.sendMessage(chatId, randomWords());
  }
});

bot.onText(/^\/start$/, async (msg) => {
  const chatId = msg.chat.id;
    try {
      const user = await db
        .db('telegrambot')
        .collection('user')
        .findOne({ id: msg.from.id });
      if (!user)
        await db.db('telegrambot').collection('user').insertOne(msg.from);
      bot.sendMessage(
        chatId,
        'Hello. Thanks for adding me!\nPlease write /gombalin to get love quote'
      );
    } catch(err)  {
      bot.sendMessage(chatId, 'Something went wrong :(');
    };
});

bot.onText(/^\/jawa/, async (msg) => {
  const phrase = jawa[Math.floor(Math.random() * jawa.length)]
  console.log({ jawa, phrase})
  bot.sendMessage(msg.chat.id, phrase)
});

bot.on('message', async (msg) => {
    try {
      console.log({msg})
      await db.collection('msg').insertOne(msg);
    } catch(err) {
      console.log({ err });
    };
});

module.exports = bot;