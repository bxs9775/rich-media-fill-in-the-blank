const models = require('../models');

const Template = models.Template;

/*Helper methods*/

/*Controller methods*/
const getTemplate = (request, response, accept) => {
  const req = request;
  const res = response;
  
  if(!req.body._id){
    return res.status(400).json({error: 'The request requires the id of the requested template.'});
  }
  
  return Template.TemplateModel.findById(req.body._id, (err,docs) => {
    if(err){
      console.log(err);
      
      return res.status(400).json({ 'error': 'An error occured.'});
    }
    
    if(docs.owner.toString() !== req.session.account._id && !docs.public) {
      return res.status(403).json({ error: 'User does not have access to this template.' });
    }
    return res.json({template: docs});
  });
}