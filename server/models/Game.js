const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// const _ = require('underscore');

let GameModel = {};

const convertId = mongoose.Types.ObjectId;

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
