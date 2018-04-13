const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const _ = require('underscore');

let TemplateModel = {};
const convertId = mongoose.Types.ObjectId;
const sanitizeString = (str) => _.escape(str).trim();

const SubelementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'blank'],
    required: true,
  },
  content: {
    type: String,
    trim: true,
    set: sanitizeString,
  },
});

const ElementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['title', 'line'],
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
    trim: true,
    set: sanitizeString,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    set: sanitizeString,
  },
  content: {
    type: [ElementSchema],
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
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

TemplateSchema.statics.findTemplates = (user, category, userFilter, callback) => {
  const search = {};
  if (category) {
    search.category = category;
  }

  const userId = { owner: convertId(user) };
  const pubFilt = { public: true };
  const allFilt = [userId, pubFilt];

  const selection = 'name category public content';

  switch (userFilter) {
    case 'user': {
      return TemplateModel.find(search).where(userId).select(selection)
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

TemplateSchema.static.sfindById = (id, callback) => {
  const search = {
    _id: convertId(id),
  };

  return TemplateModel.findOne(search).exec(callback);
};

TemplateModel = mongoose.model('Template', TemplateSchema);

module.exports.TemplateModel = TemplateModel;
module.exports.TemplateSchema = TemplateSchema;
