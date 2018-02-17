// handles working with the system data
const url = require('url');
const xmljs = require('xml-js');
const query = require('query-string');
const baseResponse = require('./baseResponse.js');

const templateString = '<templates><template name="classical-music" category="arts/culture"><title>5 <blank uppercase="true" type="adjective"/> Classical <blank uppercase="true" type="plural noun"/></title><line>1. Ode to <blank uppercase="true" type="emotion"/> by <blank uppercase="true" type="proper name"/></line><line>2. The <blank type="number"/> Seasons by <blank uppercase="true" type="proper name"/></line><line>3. Moonlight <blank uppercase="true" type="noun"/> by <blank uppercase="true" type="proper name"/></line><line>4. <blank uppercase="true" type="animal"/> <blank uppercase="true" type="noun"/> by <blank uppercase="true" type="proper name"/></line><line>5. The <blank uppercase="true" type="adjective"/> <blank uppercase="true" type="instrument"/> by <blank uppercase="true" type="proper name"/></line></template></templates>';
const templates = JSON.parse(xmljs.xml2json(templateString, { compact: false }));

const filterTemplates = (category) => {
  const { elements } = templates.elements[0];
  const filteredList = {};
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].attributes.category === category) {
      filteredList.push(elements[i]);
    }
  }
  return filteredList;
};

const selectTemplate = (name) => {
  const { elements } = templates.elements[0];
  for (let i = 0; i < elements.length; i++) {
  console.log(`Name 2: ${elements[i].attributes.name}`);
    if (elements[i].attributes.name === name) {
      return elements[i];
    }
  }
  return null;
};

const getTemplate = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);
  if (!params.name) {
    return baseResponse.writeError(response, 400, accept, 'Missing required query parameter: name.');
  }
  const template = selectTemplate(params.name);
  if (!template) {
    return baseResponse.writeError(response, 404, accept, 'The requested template could not be found.');
  }
  if (accept[0] === 'text/xml') {
    const tempXML = xmljs.json2xml(template);
    return baseResponse.writeResponse(response, 200, tempXML, accept[0]);
  }
  return baseResponse.writeResponse(response, 200, JSON.stringify(template), 'application/json');
};

const getTemplateHead = (request, response, accept) => {
};

const addTemplate = (request, response, accept) => {

};

const getTemplateList = (request, response, accept) => {

};

const getTemplateListHead = (request, response, accept) => {

};

const getGame = (request, response, accept) => {

};

const getGameHead = (request, response) => {

};

const addGame = (request, response) => {

};

module.exports = {
  getTemplate,
  getTemplateHead,
  addTemplate,
  getTemplateList,
  getTemplateListHead,
  getGame,
  getGameHead,
  addGame,
};
