const models = require('../models');

const Template = models.Template;

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
      return res.status(403).json({ error: 'The user does not have access to this template.' });
    }
    return res.json({ template: docs });
  });
};

const getTemplateHead = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body._id) {
    return res.status(400).end();
  }

  return Template.TemplateModel.findById(req.body._id, (err, docs) => {
    if (err) {
      console.log(err);

      return res.status(400).end();
    }

    if (docs.owner.toString() !== req.session.account._id && !docs.public) {
      return res.status(403).end();
    }
    return res.end();
  });
};

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
  // console.dir(req.body.content);
  const values = Object.values(req.body.content);

  const content = values.map((entry) => {
    // console.log(`Content:\n${entry}\n\n`);
    /*
    console.log('Content:\n');
    console.dir(entry);
    console.log('\n');
    */
    const subvalues = Object.values(entry.content);
    const subcontent = subvalues.map((subvalue) => subvalue);

    const element = entry;
    element.content = subcontent;
    return element;
  });

  console.dir(content);

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

  console.log(`category: ${req.query.category}\tfilter: ${req.query.filter}`);

  const category = req.query.category || null;
  const filter = req.query.filter || 'all';

  console.log(`category: ${category}\tfilter: ${filter}`);

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

const getTemplateListHead = (request, response) => {
  const req = request;
  const res = response;

  const category = (req.body.req) || null;
  const filter = (req.body.filter) || 'all';

  Template.TemplateModel.findTemplates(req.session.account._id, category, filter, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).end();
    }

    const count = docs.length;

    res.set('count', count);
    return res.end();
  });
};

/* Export modules*/
module.exports.getTemplate = getTemplate;
module.exports.getTemplateHead = getTemplateHead;
module.exports.addTemplate = addTemplate;
module.exports.getTemplateList = getTemplateList;
module.exports.getTemplateListHead = getTemplateListHead;
