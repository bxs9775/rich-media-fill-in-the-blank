const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const _ = require('underscore');

let GameModel = {};

const convertId = mongoose.Types.ObjectId;
const sanitizeString = (str) => _.excape(str).trim();
const sanitizeArray = (array) => array.map(sanitizeString);

const GameSchema = {
  name: {
    type: String,
    required: true,
    trim: true,
    set: sanitizeString,
  },
  template: {
    type: String,
    required: true,
    trim: true,
    set: sanitizeString,
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
};

GameSchema.statics.find = (user, name, template, callback) => {
  const search = {
    owner: convertId(user),
    name,
    template,
  };
  return GameModel.find(search).select('name template words').exec(callback);
};

GameModel = mongoose.model('Game', GameModel);

module.exports.TemplateModel = GameModel;
module.exports.TemplateSchema = GameSchema;
