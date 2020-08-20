/** Import 3rd party modules */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const packageInfo = require('./package.json');
const bot = require('./bot')


/** Express */
const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({
    name: packageInfo.name,
    version: packageInfo.version,
  });
});

app.post(`/${bot.token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Web server listening on PORT ${process.env.PORT}`);
});
