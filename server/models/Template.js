const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// const _ = require('underscore');

let TemplateModel = {};

const SubelementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['title', 'line', 'text', 'blank'],
    required: true,
  },
  content: {
    type: String,
  },
});

const ElementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['title', 'line', 'text', 'blank'],
    required: true,
  },
  content: {
    type: [SubelementSchema],
  },
});

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  public: {
    type: Boolean,
    default: () => false,
  },
  content: {
    type: [ElementSchema],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

TemplateModel = mongoose.model('Template', TemplateModel);

module.exports.TemplateModel = TemplateModel;
module.exports.TemplateSchema = TemplateSchema;
