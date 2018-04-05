const models = require('../models');

const Template = models.Template;

/* Helper methods*/

/* Controller methods*/
const getTemplate = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body._id) {
    const message = 'The request requires the id of the requested template.';
    return res.status(400).json({ error: message });
  }

  return Template.TemplateModel.findById(req.body._id, (err, docs) => {
    if (err) {
      console.log(err);

      return res.status(400).json({ error: 'An error occured.' });
    }

    if (docs.owner.toString() !== req.session.account._id && !docs.public) {
      return res.status(403).json({ error: 'User does not have access to this template.' });
    }
    return res.json({ template: docs });
  });
};

const getTemplateHead = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body._id) {
    const message = 'The request requires the id of the requested template.';
    return res.status(400).json({ error: message });
  }

  return Template.TemplateModel.findById(req.body._id, (err, docs) => {
    if (err) {
      console.log(err);

      return res.status(400).json({ error: 'An error occured.' });
    }

    if (docs.owner.toString() !== req.session.account._id && !docs.public) {
      return res.status(403).json({ error: 'User does not have access to this template.' });
    }
    return res.end();
  });
};

const addTemplate = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body.name) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!req.body.category) {
    return res.status(400).json({ error: 'Category is required.' });
  }
  if (!req.body.content) {
    return res.status(400).json({ error: 'Text is required.' });
  }

  // Formatting content?

  const templateData = {
    name: req.body.name,
    category: req.body.category,
    content: req.body.content,
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
  });

  return templatePromise;
};

/* Export modules*/
module.exports.getTemplate = getTemplate;
module.exports.getTemplateHead = getTemplateHead;
module.exports.addTemplate = addTemplate;
