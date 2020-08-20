const { MongoClient } = require('mongodb');


async function connectDb() {
  /** Connect to database */
  const client = await MongoClient.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  return client.db('telegram-bot');
}


module.exports = connectDb;