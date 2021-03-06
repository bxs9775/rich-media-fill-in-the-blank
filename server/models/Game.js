const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const _ = require('underscore');

let GameModel = {};

const convertId = mongoose.Types.ObjectId;
const sanitizeString = (str) => _.escape(str).trim();
const sanitizeArray = (array) => array.map(sanitizeString);

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: sanitizeString,
    match: /^[A-Za-z0-9 .]{1,16}$/,
  },
  template: {
    type: String,
    required: true,
    trim: true,
    set: sanitizeString,
    match: /^[A-Za-z0-9 .]{1,16}$/,
  },
  words: {
    type: [String],
    required: true,
    set: sanitizeArray,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

GameSchema.statics.findGames = (user, template, callback) => {
  const search = {
    owner: convertId(user),
    template,
  };
  return GameModel.find(search).select('name template words').exec(callback);
};

GameSchema.statics.findById = (id, callback) => {
  const search = {
    _id: convertId(id),
  };

  return GameModel.findOne(search).select('name template words').exec(callback);
};

GameModel = mongoose.model('Game', GameSchema);

module.exports.GameModel = GameModel;
module.exports.GameSchema = GameSchema;
