const mongoose = require('mongoose');
const mongoJoin = require('mongo-join-query');

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

TemplateSchema.statics.findTemplates = (user, criteria, callback) => {
  const options = {
    find: {},
    populate: ['owner'],
  };
  const searchList = [];
  if (criteria.category) {
    searchList.push({ category: criteria.category });
  }

  if (criteria.user) {
    const idFilt = { 'owner._id': convertId(criteria.user) };
    const nameFilt = { 'owner.username': criteria.user };
    let userSearch = { $or: [idFilt, nameFilt] };
    if (!(criteria.user === user._id || criteria.user === user.username)) {
      userSearch = { $and: [{ public: true }, userSearch] };
    }
    searchList.push(userSearch);
  }

  const userFilt = { 'owner._id': convertId(user) };
  // const pubFilt = { public: true };
  // const allFilt = [userId, pubFilt];


  switch (criteria.access) {
    case 'public':
      searchList.push({ public: true });
      break;
    case 'private':
      searchList.push({ $and: [{ public: false }, userFilt] });
      break;
    case 'all':
      // falls through
    default:
      searchList.push({ $or: [userFilt, { public: true }] });
      break;
  }

  if (searchList.length === 1) {
    options.find = searchList[0];
  } else {
    options.find = { $and: searchList };
  }

  // Searches on Template with info from Account
  mongoJoin(
    TemplateModel,
    options,
    (err, docs) => {
      if (err || !docs) {
        callback(err, null);
      }
      const dataArr = docs.results;
      console.dir(dataArr);
      // Creates JSON with only the elements that should be returned to the user.
      const templates = dataArr.map((template) => ({
        name: template.name,
        category: template.category,
        public: template.public,
        content: template.content,
        user: template.owner.username,
      }));
      console.dir(templates);
      callback(null, templates);
    }
  );
};

TemplateSchema.static.findById = (id, callback) => {
  const search = {
    _id: convertId(id),
  };

  return TemplateModel.findOne(search).exec(callback);
};

TemplateModel = mongoose.model('Template', TemplateSchema);

module.exports.TemplateModel = TemplateModel;
module.exports.TemplateSchema = TemplateSchema;
