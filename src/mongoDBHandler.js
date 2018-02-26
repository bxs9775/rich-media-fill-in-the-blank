var mongodb = require("mongodb");
var MongoClient = mongodb.client;

var dbURL = process.env.MONGOLAB_URI;

//
const dbGetTemplate = (filter) => {
  //find
};

//Adds new template or updates existing template
const dbAddTemplate = (template) => {
  //update - upsert:true
};

//
const dbGetTemplates = (filter) => {
  //find
};

//
const dbGetSheet = (filter) => {
  //find
};

const dbAddSheet = (sheet) => {
  //update - upsert:true
};

// export modules
module.exports = {
  dbGetTemplate,
  dbAddTemplate,
  dbGetTemplates,
  dbGetSheet,
  dbAddSheet,
};