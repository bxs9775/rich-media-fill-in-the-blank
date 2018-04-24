const models = require('../models');

const Template = models.Template;
const Account = models.Account;

/* Controller methods*/
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

const shareTemplate = (request, response) => {
  const req = request;
  const res = response;

  if (!(req.body._id)) {
    return res.status(400).json({ error: '_id is required' });
  }
  if (!(req.body.user)) {
    return res.status(400).json({ error: 'user is required' });
  }

  console.log(`Id = ${req.body._id}`);

  return Template.TemplateModel.findById(req.body._id, (err, template) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured.' });
    }
    console.dir(template);

    const owner = `${template.owner}`;
    console.dir(owner);
    console.dir(req.session.account._id);

    if (owner !== req.session.account._id) {
      return res.status(400).json({ error: 'Error sharing template: do not own template' });
    }
    const temp = template;
    return Account.AccountModel.findByUsername(req.body.user, (err2, user) => {
      if (err2) {
        console.log(err2);
        return res.status(400).json({ error: 'An error occured.' });
      }
      console.dir(user);
      temp.owner = user._id;
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
