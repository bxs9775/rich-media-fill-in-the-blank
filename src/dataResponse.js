// handles working with the system data
const url = require('url');
const xmljs = require('xml-js');
const query = require('query-string');
const baseResponse = require('./baseResponse.js');

const templateString = '<templates><template name="classical-music" category="arts-and-culture"><title>5 <blank uppercase="true" type="adjective"/> Classical <blank uppercase="true" type="plural noun"/></title><line>1. Ode to <blank uppercase="true" type="emotion"/> by <blank uppercase="true" type="proper name"/></line><line>2. The <blank type="number"/> Seasons by <blank uppercase="true" type="proper name"/></line><line>3. Moonlight <blank uppercase="true" type="noun"/> by <blank uppercase="true" type="proper name"/></line><line>4. <blank uppercase="true" type="animal"/> <blank uppercase="true" type="noun"/> by <blank uppercase="true" type="proper name"/></line><line>5. The <blank uppercase="true" type="adjective"/> <blank uppercase="true" type="instrument"/> by <blank uppercase="true" type="proper name"/></line></template></templates>';
const templates = JSON.parse(xmljs.xml2json(templateString, { compact: false }));
const saves = { sheets: [] };

const parseBody = (request, response, accept, action) => {
  // Stores loaded in body
  const body = [];

  // onError code
  request.on('error', (err) => {
    console.dir(err);
    baseResponse.writeError(response, 400, accept, err.message);
  });

  // onDate code
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // onEnd code
  request.on('end', () => action(body));
};


const getTemplateElements = () => templates.elements[0].elements;

const getFormattedTemplate = (template) => {
  console.dir(template);
  return `<template name="${template.attributes.name}" category="${template.attributes.category}">${xmljs.json2xml(template)}</template>`;
};

const getFormatedSheet = (sheet) => {
  let tempXML = `<sheet><name>${sheet.name}</name><template>${sheet.template}</template><words>`;
  // Solving no-restricted-synax error
  // Based on:
  // https://stackoverflow.com/questions/43807515/eslint-doesnt-allow-for-in
  const entries = sheet.words.entries();
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    console.dir(entry);
    tempXML = `${tempXML}<${entry.key}>${entry.value}</${entry.key}>`;
  }
  tempXML = `${tempXML}</words></sheet>`;
  return tempXML;
};

const countElements = (elements) => {
  let count = 0;
  for (let i = 0; i < elements.length; i++) {
    count++;
  }
  return count;
};

const filterJSON = (matches, elements, compact) => {
  const filteredList = [];
  for (let i = 0; i < elements.length; i++) {
    const attributes = (compact) ? elements[i] : elements[i].attributes;
    if ((!matches.category || (attributes.category === matches.category))
        && (!matches.template || (attributes.template === matches.template))) {
      filteredList.push(elements[i]);
    }
  }
  return filteredList;
};

const getIndexFromJSON = (matches, elements, compact) => {
  console.log(matches);
  for (let i = 0; i < elements.length; i++) {
    const attributes = (compact) ? elements[i] : elements[i].attributes;
    if ((!matches.name || (attributes.name === matches.name))
        && (!matches.template || (attributes.template === matches.template))) {
      return i;
    }
  }
  return -1;
};

const selectJSON = (matches, elements, compact) => {
  console.log(matches);
  for (let i = 0; i < elements.length; i++) {
    const attributes = (compact) ? elements[i] : elements[i].attributes;
    if ((!matches.name || (attributes.name === matches.name))
        && (!matches.template || (attributes.template === matches.template))) {
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
  const template = selectJSON({ name: params.name }, getTemplateElements(), false);
  if (!template) {
    return baseResponse.writeError(response, 404, accept, 'The requested template could not be found.');
  }
  if (accept[0] === 'text/xml') {
    const tempXML = getFormattedTemplate(template);
    return baseResponse.writeResponse(response, 200, tempXML, accept[0]);
  }
  return baseResponse.writeResponse(response, 200, JSON.stringify(template), 'application/json');
};

const getTemplateHead = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);
  if (!params.name) {
    return baseResponse.writeErrorHead(response, 400, accept);
  }
  const template = selectJSON(params.name, getTemplateElements(), false);
  if (!template) {
    return baseResponse.writeErrorHead(response, 404, accept);
  }
  if (accept[0] === 'text/xml') {
    return baseResponse.writeResponseHead(response, 200, accept[0]);
  }
  return baseResponse.writeResponseHead(response, 200, 'application/json');
};

const addTemplate = (request, response, accept) => {
  parseBody(request, response, accept, (body) => {
    // console.dir(request);

    const bodyString = Buffer.concat(body).toString();
    // console.dir(bodyString);

    try {
      let jsonObj = {};
      if (request.headers['content-type'] && request.headers['content-type'] === 'text/xml') {
        const xmlObj = bodyString;
        jsonObj = JSON.parse(xmljs.xml2json(xmlObj));
      } else {
        jsonObj = JSON.parse(bodyString);
      }
      console.dir(jsonObj);
      console.dir(jsonObj.elements[0].attributes.name);
      const matches = { name: jsonObj.elements[0].attributes.name };
      const index = getIndexFromJSON(matches, getTemplateElements(), false);

      if (index < 0) {
        templates.elements[0].elements.push(jsonObj.elements[0]);
        return baseResponse.writeError(response, 201, accept);
      }
      [templates.elements[0].elements[index]] = jsonObj.elements;
      return baseResponse.writeErrorHead(response, 204, accept);
    } catch (e) {
      console.dir(e.name);
      return baseResponse.writeError(response, 400, accept, e.message);
    }
  });
};

const getTemplateList = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);

  const elements = getTemplateElements();
  const matches = { category: params.category };
  const list = (params.category) ? filterJSON({ matches }, elements, false) : elements;
  const count = countElements(list);

  response.setHeader('count', count);

  if (accept[0] === 'text/xml') {
    let tempXML = '<templates>';
    for (let i = 0; i < count; i++) {
      tempXML = `${tempXML}${getFormattedTemplate(list[i])}`;
    }
    tempXML = `${tempXML}</templates>`;
    return baseResponse.writeResponse(response, 200, tempXML, accept[0]);
  }
  return baseResponse.writeResponse(response, 200, JSON.stringify(list), 'application/json');
};

const getTemplateListHead = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);

  const elements = getTemplateElements();
  const matches = { category: params.category };
  const list = (params.category) ? filterJSON(matches, elements, false) : elements;
  const count = countElements(list);

  response.setHeader('count', count);

  if (accept[0] === 'text/xml') {
    return baseResponse.writeResponseHead(response, 200, accept[0]);
  }
  return baseResponse.writeResponseHead(response, 200, 'application/json');
};

const getExample = (request, response, accept) => {
  const exampleXML = '<template name="example1" category="examples"><title>Example 1</title><line>This is a <blank type="adjective"/> example.</line></template>';

  if (accept[0] === 'text/xml') {
    return baseResponse.writeResponse(response, 200, exampleXML, accept[0]);
  }
  return baseResponse.writeResponse(response, 200, xmljs.xml2json(exampleXML), 'application/json');
};

const getExampleHead = (request, response, accept) => baseResponse.writeResponseHead(response, 200, (accept[0] === 'text/xml' ? accept[0] : 'application/json'));

const getGame = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);
  if (!params.name || !params.template) {
    return baseResponse.writeError(response, 400, accept, `Missing required query parameter(s): ${(!params.name) ? 'name' : ''}${(!params.name && !params.template) ? ', ' : ''}${(!params.template) ? 'template' : ''}.`);
  }
  const sheet = selectJSON({ name: params.name, template: params.template }, saves.sheets, true);
  if (!sheet) {
    return baseResponse.writeError(response, 404, accept, 'The requested saved sheet could not be found.');
  }
  if (accept[0] === 'text/xml') {
    const tempXML = getFormatedSheet(sheet);
    console.dir(tempXML);
    return baseResponse.writeResponse(response, 200, tempXML, accept[0]);
  }
  return baseResponse.writeResponse(response, 200, JSON.stringify(sheet), 'application/json');
};

const getGameHead = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);
  if (!params.name || !params.template) {
    return baseResponse.writeErrorHead(response, 400, accept);
  }
  const sheet = selectJSON({ name: params.name, template: params.template }, saves.sheets, true);
  if (!sheet) {
    return baseResponse.writeErrorHead(response, 404, accept);
  }
  if (accept[0] === 'text/xml') {
    return baseResponse.writeErrorHead(response, 200, accept[0]);
  }
  return baseResponse.writeErrorHead(response, 200, 'application/json');
};

const addGame = (request, response, accept) => {
  parseBody(request, response, accept, (body) => {
    const bodyString = Buffer.concat(body).toString();

    let jsonObj = {};
    if (request.headers['content-type'] && request.headers['content-type'] === 'text/xml') {
      const xmlObj = bodyString;
      const tempJSON = JSON.parse(xmljs.xml2json(xmlObj, { compact: true }));
      console.dir(tempJSON);
      jsonObj.name = tempJSON.sheet.name._text;
      jsonObj.template = tempJSON.sheet.template._text;
      jsonObj.words = {};

      // Solving no-restricted-synax error
      // Based on:
      // https://stackoverflow.com/questions/43807515/eslint-doesnt-allow-for-in
      const entries = tempJSON.sheet.words.entries();
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        jsonObj.words[entry.key] = entry.value._text;
      }
      console.dir(jsonObj);
    } else {
      jsonObj = JSON.parse(bodyString);
    }
    const matches = { name: jsonObj.name, template: jsonObj.template };
    const index = getIndexFromJSON(matches, saves.sheets, true);
    if (index < 0) {
      saves.sheets.push(jsonObj);
      return baseResponse.writeError(response, 201, accept);
    }
    saves.sheets[index] = jsonObj;
    return baseResponse.writeErrorHead(response, 204, accept);
  });
};

const getGameList = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);

  const elements = saves.sheets;
  const matches = { template: params.template };
  const list = (params.template) ? filterJSON(matches, elements, true) : elements;
  const count = countElements(list);

  response.setHeader('count', count);

  if (accept[0] === 'text/xml') {
    let tempXML = '<sheets>';
    for (let i = 0; i < count; i++) {
      tempXML = `${tempXML}${getFormatedSheet(list[i])}`;
    }
    tempXML = `${tempXML}</sheet>`;
    return baseResponse.writeResponse(response, 200, tempXML, accept[0]);
  }
  return baseResponse.writeResponse(response, 200, JSON.stringify(list), 'application/json');
};

const getGameListHead = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);

  const elements = saves.sheets;
  const matches = { template: params.template };
  const list = (params.template) ? filterJSON(matches, elements, true) : elements;
  const count = countElements(list);

  response.setHeader('count', count);

  if (accept[0] === 'text/xml') {
    return baseResponse.writeResponseHead(response, 200, accept[0]);
  }
  return baseResponse.writeResponseHead(response, 200, 'application/json');
};

module.exports = {
  getTemplate,
  getTemplateHead,
  addTemplate,
  getTemplateList,
  getTemplateListHead,
  getExample,
  getExampleHead,
  getGame,
  getGameHead,
  addGame,
  getGameList,
  getGameListHead,
};
