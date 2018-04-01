const mongodb = require('mongodb');

const { MongoClient } = mongodb;

const dbURL = process.env.MONGOLAB_URI;
const dbName = 'fill-in-the-blanks';

// Gets object(s) in the given collection
// Params:
//  collection - the collection in the database to be seached
//  filter - provides the filtering or searching criteria for the search
//  action - the function that is run when the object is retrieved
const dbGet = (collection, filter, action) => {
  MongoClient.connect(dbURL, (err, client) => {
    if (err) {
      if (client) {
        client.close();
      }
      return action(err, null);
    }

    const db = client.db(dbName);
    const data = db.collection(collection).find(filter).toArray(action);

    client.close();

    return data;
  });
};

// Adds or updates an object in the given collection
// Params:
//  collection - the collection in the database to be updated
//  filter - filter used for find duplicates
//  If there is a duplicate the server will update the entry instead of adding a new one
//  element - the new information for the object
//  action - the fuction that will run when the addition/update finishes
const dbAdd = (collection, filter, element, action) => {
  // update - upsert:true
  MongoClient.connect(dbURL, (err, client) => {
    if (err) {
      if (client) {
        client.close();
      }
      return action(err, null);
    }

    const db = client.db(dbName);

    const update = { $set: element };
    const options = { upsert: true };
    const info = db.collection(collection).updateOne(filter, update, options, action);

    client.close();

    return info;
  });
};

// export modules
module.exports = {
  dbGet,
  dbAdd,
};
