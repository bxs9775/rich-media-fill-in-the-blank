const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// const _ = require('underscore');

let GameModel = {};

const GameSchema = {
  name: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    required: true,
  },
  words: {
    type: [String],
    required: true,
  },
};

GameModel = mongoose.model('Game', GameModel);

module.exports.TemplateModel = GameModel;
module.exports.TemplateSchema = GameSchema;
