const models = require('../models');

const Template = models.Template;
const Account = models.Account;

/* Controller methods*/
// adds a Template to the database
const addTemplate = (request, response) => {
  const req = request;
  const res = response;

  // data validation
  if (!req.body.name) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!req.body.category) {
    return res.status(400).json({ error: 'Category is required.' });
  }
  if (!req.body.content) {
    return res.status(400).json({ error: 'Text is required.' });
  }

  // Formatting content
  const values = Object.values(req.body.content);

  const content = values.map((entry) => {
    const subvalues = Object.values(entry.content);
    const subcontent = subvalues.map((subvalue) => subvalue);

    const element = entry;
    element.content = subcontent;
    return element;
  });

  // create object
  const templateData = {
    name: `${req.body.name}`,
    category: `${req.body.category}`,
    content,
    owner: req.session.account._id,
  };

  if (req.body.public) {
    templateData.public = req.body.public;
  }

  const newTemplate = new Template.TemplateModel(templateData);

  const templatePromise = newTemplate.save();

  templatePromise.then(() => res.json({ message: 'Template saved correctly.' }));

  templatePromise.catch((err) => {
    console.log(err);

    return res.status(400).json({ error: 'An error occurred' });
  });

  return templatePromise;
};

// Gets a list of Templates from the database
// Can be filtered by category, user, or public/private
// Can be sorted based on the sort and direction criteria
// Limit limits the number of results
const getTemplateList = (request, response) => {
  const req = request;
  const res = response;

  const category = req.query.category || null;
  const user = req.query.user || null;
  const access = req.query.access || 'all';
  const sort = req.query.sort || null;
  let direction = null;
  if (sort) {
    direction = req.query.direction || 'ascending';
  }
  let limit = req.query.limit || null;
  if (limit) {
    limit = parseInt(limit, 10);

    if (limit < 1 || limit > 100) {
      res.status(400).json({ error: 'Limit must be between 1 and 50.' });
    }
  }
  const criteria = {
    category,
    user,
    access,
    sort,
    direction,
    limit,
  };

  return Template.TemplateModel.findTemplates(req.session.account, criteria, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured.' });
    }

    const count = docs.length;

    res.set('count', count);
    return res.json({ templates: docs });
  });
};

// Adds a use's idr to the templates shared list.
// Requires "user" - the username for a user
const shareTemplate = (request, response) => {
  const req = request;
  const res = response;

  if (!(req.body._id)) {
    return res.status(400).json({ error: '_id is required' });
  }
  if (!(req.body.user)) {
    return res.status(400).json({ error: 'user is required' });
  }

  return Template.TemplateModel.findById(req.body._id, (err, template) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured.' });
    }
    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }
    if (template.public) {
      return res.status(400).json({ error: 'The template is already public.' });
    }

    const owner = `${template.owner}`;

    if (owner !== req.session.account._id) {
      return res.status(400).json({ error: "Don't have permission to share." });
    }
    const temp = template;
    return Account.AccountModel.findByUsername(req.body.user, (err2, user) => {
      if (err2) {
        console.log(err2);
        return res.status(400).json({ error: 'An error occured.' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const repeatVals = temp.shared.filter((id) => (id.equals(user._id)));
      if (temp.owner.equals(user._id) || repeatVals.length > 0) {
        return res.status(400).json({ error: 'User already has access.' });
      }
      const shared = JSON.parse(JSON.stringify(temp.shared));
      shared.push(user._id);
      temp.shared = shared;
      const savePromise = temp.save();

      savePromise.then(() => res.status(204).end());

      savePromise.catch((err3) => {
        console.log(err3);

        return res.status(400).json({ error: 'An error occurred' });
      });

      return savePromise;
    });
  });
};

/* Export modules*/
module.exports.addTemplate = addTemplate;
module.exports.getTemplateList = getTemplateList;
module.exports.shareTemplate = shareTemplate;
