const mongodb = require('mongodb');

const { MongoClient } = mongodb;

const dbURL = process.env.MONGOLAB_URI;
const dbName = 'fill-in-the-blanks';

//
const dbGet = (collection, filter, action) => {
  // find
  MongoClient.connect(dbURL, (err, client) => {
    if (err) {
      if (client) {
        client.close();
      }
      return action(err, null);
    }

    const db = client.db(dbName);
    const data = db.collection(collection).find(filter).limit(1).toArray(action);

    client.close();

    return data;
  });
};

// Adds new template or updates existing template
const dbAdd = (collection, filter, element, action) => {
  console.log(`Url: ${dbURL}`);
  // update - upsert:true
  MongoClient.connect(dbURL, (err, client) => {
    console.log('Connecting - add');
    // console.dir(client);
    if (err) {
      console.log(err.message);
      if (client) {
        client.close();
      }
      return action(err, null);
    }

    const db = client.db(dbName);
    // console.dir(db);

    const update = { $set: element };
    const options = { upsert: true };
    const info = db.collection(collection).updateOne(filter, update, options, action);
    // console.dir(info);

    client.close();

    return info;
  });
};

// export modules
module.exports = {
  dbGet,
  dbAdd,
};
