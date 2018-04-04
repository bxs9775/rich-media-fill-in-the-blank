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
  content: {
    type: [ElementSchema],
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

  const userFilt = { owner: convertId(user) };
  const pubFilt = { public: true };
  const allFilt = [userFilt, pubFilt];

  const selection = 'name category public content';

  switch (userFilter) {
    case 'user': {
      return TemplateModel.find(search).where(userFilt).select(selection)
        .exec(callback);
    }
    case 'public': {
      return TemplateModel.find(search).where(pubFilt).select(selection)
        .exec(callback);
    }
    case 'all':
      // falls through
    default:
      return TemplateModel.find(search).or(allFilt).select(selection)
        .exec(callback);
  }
};

TemplateSchema.static.findById(id, callback) => {
  const search = {
    _id = convertId(id);
  };
  
  return TemplateModel.findOne(search).exec(callback);
}

TemplateModel = mongoose.model('Template', TemplateModel);

module.exports.TemplateModel = TemplateModel;
module.exports.TemplateSchema = TemplateSchema;
