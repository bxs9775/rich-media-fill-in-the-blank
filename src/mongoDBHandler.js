const mongodb = require('mongodb');

const MongoClient = mongodb.client;
//const baseResponse = require('./baseResponse.js');

const dbURL = process.env.MONGOLAB_URI;

//
const dbGet = (collection, filter) => {
  // find
  MongoClient.connect(dbURL, (err, db) => {
    if (err) {
      db.close();
      return { error: err };
    }
    const data = db.collection(collection).find(filter);
    console.dir(data);

    db.close();

    return data;
  });
};

// Adds new template or updates existing template
const dbAdd = (collection, filter, update) => {
  // update - upsert:true
  MongoClient.connect(dbURL, (err, db) => {
    if (err) {
      db.close();
      return { error: err };
    }

    const info = db.collection(collection).updateOne(filter, update, { upsert: true });
    console.dir(info);

    db.close();

    return info;
  });
};

// export modules
module.exports = {
  dbGet,
  dbAdd,
};
