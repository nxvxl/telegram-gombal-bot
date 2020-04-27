const rp = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');

// const URI = 'https://www.legit.ng/1192823-sweet-words-a-woman-fall-love-you.html';
const URI = 'https://katasiana.com/kata-kata-gombal/';
const FILE = 'gombalan.json';

rp(URI)
 .then(html => {
   const phrases = $('ul li', html).map((i, el) => (
    el.children[0].data
   )).get();
   
   fs.writeFileSync(FILE, JSON.stringify(phrases, null, 2))
 })
 .catch(err => console.log({ err }))