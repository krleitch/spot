export { initDb };

const mongo = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

function initDb() {
  mongo.connect(
    url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    (err: any, client: any) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Connection established to Mongo');
      const db = client.db('spot');
    }
  );
}
