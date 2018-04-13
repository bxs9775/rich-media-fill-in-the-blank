const models = require('../models');

const Template = models.Template;

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
  const filter = req.query.filter || 'all';

  Template.TemplateModel.findTemplates(req.session.account._id, category, filter, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured.' });
    }

    const count = docs.length;

    res.set('count', count);
    return res.json({ templates: docs });
  });
};
/* Export modules*/
module.exports.addTemplate = addTemplate;
module.exports.getTemplateList = getTemplateList;
