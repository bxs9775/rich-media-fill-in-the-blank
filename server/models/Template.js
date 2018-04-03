const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// const _ = require('underscore');

let TemplateModel = {};

const convertId = mongoose.Types.ObjectId;

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

TemplateSchema.static.find = (user, category, userFilter, callback) => {
  const search = {};
  if (category) {
    search.category = category;
  }

  const filter1 = { owner: convertId(user) };
  const filter2 = { public: true };
  switch (userFilter) {
    case 'user': {
      return TemplateModel.find(search).where(filter1);
    }
    case 'public': {
      return TemplateModel.find(search).where(filter2);
    }
    case 'all':
      // falls through
    default:
      return TemplateModel.find(search).or([filter1, filter2]).exec(callback);
  }
};

TemplateModel = mongoose.model('Template', TemplateModel);

module.exports.TemplateModel = TemplateModel;
module.exports.TemplateSchema = TemplateSchema;
