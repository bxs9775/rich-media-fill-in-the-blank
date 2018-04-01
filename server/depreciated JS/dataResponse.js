// handles working with the system data
const url = require('url');
const xmljs = require('xml-js');
const query = require('query-string');
const baseResponse = require('./baseResponse.js');
const mongoHandler = require('./mongoDBHandler.js');

// Reads response body from a data stream.
// Params:
//  request - an AJAX request
//  response - the response body for returning information from the server
//  accept - an array of accept headers
//  action - the fuction run when the stream ends successfully
const parseBody = (request, response, accept, action) => {
  // Stores loaded in body
  const body = [];

  // onError code
  request.on('error', (err) => {
    baseResponse.writeError(response, 400, accept, err.message);
  });

  // onDate code
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // onEnd code
  request.on('end', () => action(body));
};

// Creates a formatted XML string from the given template JSON
// params:
//  template - the 'template', blank game setup, to be formatted
// Returns:
//  A formatted XML string for the template
const getFormattedTemplate = template => `<template name="${template.attributes.name}" category="${template.attributes.category}">${xmljs.json2xml(template)}</template>`;

// Converts the given sheet into an XML string
// Params:
//  sheet - the 'sheet, saved game info, to be formatted
// Returns:
//  A formatted XML string for the sheet
const getFormatedSheet = (sheet) => {
  let tempXML = `<sheet><name>${sheet.name}</name><template>${sheet.template}</template><words>`;
  // Solving no-restricted-synax error
  // Based on:
  // https://stackoverflow.com/questions/43807515/eslint-doesnt-allow-for-in
  const entries = Object.entries(sheet.words);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    tempXML = `${tempXML}<${entry[0]}>${entry[1]}</${entry[0]}>`;
  }
  tempXML = `${tempXML}</words></sheet>`;
  return tempXML;
};

// Gets a template (blank game) object.
// Params:
//  request - AJAX request object
//  Must contain a name query parameter for selecting the right template
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getTemplate = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);
  if (!params.name) {
    return baseResponse.writeError(response, 400, accept, 'Missing required query parameter: name.');
  }
  return mongoHandler.dbGet('templates', { name: params.name }, (err, result) => {
    if (err) {
      return baseResponse.writeError(response, 500, accept, err.message);
    }

    if (result.length < 1) {
      return baseResponse.writeError(response, 404, accept, 'The requested template could not be found.');
    }

    const template = result[0].elements[0];

    if (accept[0] === 'text/xml') {
      const tempXML = getFormattedTemplate(template);
      return baseResponse.writeResponse(response, 200, tempXML, accept[0]);
    }
    return baseResponse.writeResponse(response, 200, JSON.stringify(template), 'application/json');
  });
};


// Get the response headers a template (blank game) object.
// Params:
//  request - AJAX request object
//  Must contain a name query parameter for selecting the right template
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getTemplateHead = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);
  if (!params.name) {
    return baseResponse.writeErrorHead(response, 400, accept);
  }
  return mongoHandler.dbGet('templates', { name: params.name }, (err, result) => {
    if (err) {
      return baseResponse.writeError(response, 500, accept, err.message);
    }

    if (result.length < 1) {
      return baseResponse.writeErrorHead(response, 404, accept);
    }

    if (accept[0] === 'text/xml') {
      return baseResponse.writeResponseHead(response, 200, accept[0]);
    }
    return baseResponse.writeResponseHead(response, 200, 'application/json');
  });
};

// Adds a template (blank game) object.
// Params:
//  request - AJAX request object
//  Must contain a request body containing a template.
//  XML templates look like the following:
//    <template name="example1" category="examples">
//      <title>Example 1</title><line>This is a <blank type="adjective"/> example.</line>
//    </template>
//  JSON templates use xmljs's non-compact JSON format(https://www.npmjs.com/package/xml-js), ex.
//    {"elements":[{"type":"element","name":"template",
//    "attributes":{"name":"example1","category":"examples"},
//    "elements":[{"type":"element","name":"title","elements":[{"type":"text","text":"Example 1"}]},
//    {"type":"element","name":"line","elements":[{"type":"text","text":"This is a "},
//    {"type":"element","name":"blank","attributes":{"type":"adjective"}},
//    {"type":"text","text":" example."}]}]}]}
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const addTemplate = (request, response, accept) => {
  parseBody(request, response, accept, (body) => {
    const bodyString = Buffer.concat(body).toString();

    try {
      let jsonObj = {};
      // Get the template info
      if (request.headers['content-type'] && request.headers['content-type'] === 'text/xml') {
        const xmlObj = bodyString;
        jsonObj = JSON.parse(xmljs.xml2json(xmlObj));
      } else {
        jsonObj = JSON.parse(bodyString);
      }

      // Check validity of the JSON
      if (!jsonObj.elements || !jsonObj.elements[0] || jsonObj.elements[0].name !== 'template') {
        return baseResponse.writeError(response, 400, accept, 'Template element not found in the begining of the object.');
      }

      const element = jsonObj.elements[0];
      if (!element.attributes || !element.attributes.name || !element.attributes.category) {
        let msg = 'Missing attributes in the template: ';
        if (!element.attributes) {
          msg = `${msg}name, category`;
        } else {
          if (!element.attributes.name) {
            msg = `${msg}name${(!jsonObj.elements[0].attributes.category) ? ', ' : ''}`;
          }
          if (!element.attributes.category) {
            msg = `${msg}category`;
          }
        }
        return baseResponse.writeError(response, 400, accept, msg);
      }
      if (!jsonObj.elements[0].elements) {
        return baseResponse.writeError(response, 400, accept, 'The template needs title and line elements to render.');
      }
      const topElements = jsonObj.elements[0].elements;
      for (let i = 0; i < topElements.length; i++) {
        if (!(topElements[i].name === 'title' || topElements[i].name === 'line')) {
          const msg = `Unexpected element name - ${topElements[i].name}: expected title or line.`;
          return baseResponse.writeError(response, 400, accept, msg);
        }
        if (topElements[i].elements) {
          const subelements = topElements[i].elements;
          for (let j = 0; j < subelements.length; j++) {
            if (!(subelements[j].type === 'text' || (subelements[j].type === 'element' && subelements[j].name === 'blank'))) {
              let elemName = '';
              if (subelements[j].type) {
                elemName = `${elemName}type - ${subelements[j].type}`;
                if (subelements[j].name) {
                  elemName = `${elemName}, `;
                }
              }
              if (subelements[j].name) {
                elemName = `${elemName}name - ${subelements[j].name}`;
              }
              const msg = `Unexpected element ${elemName}: expected blank element or text.`;
              return baseResponse.writeError(response, 400, accept, msg);
            }
          }
        }
      }

      const filter = { name: jsonObj.elements[0].attributes.name };
      return mongoHandler.dbAdd('templates', filter, jsonObj, (err, result) => {
        if (err) {
          return baseResponse.writeError(response, 500, accept, err.message);
        }
        if (result.matchedCount === 0) {
          return baseResponse.writeError(response, 201, accept);
        }
        return baseResponse.writeErrorHead(response, 204, accept);
      });
    } catch (e) {
      // When an error is encountered, send a 400 error
      return baseResponse.writeError(response, 400, accept, e.message);
    }
  });
};

// Responds with a list of templates
// Params:
//  request - AJAX request object
//  Can contain an optional category query parameter for filtering results
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getTemplateList = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);

  const queryStr = { 'elements.attributes.category': params.category };
  const filter = (params.category) ? queryStr : {};

  return mongoHandler.dbGet('templates', filter, (err, results) => {
    if (err) {
      return baseResponse.writeError(response, 500, accept, err.message);
    }

    const count = results.length;

    response.setHeader('count', count);

    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(results[i].elements[0]);
    }

    if (accept[0] === 'text/xml') {
      let tempXML = '<templates>';
      for (let i = 0; i < count; i++) {
        tempXML = `${tempXML}${getFormattedTemplate(list[i])}`;
      }
      tempXML = `${tempXML}</templates>`;
      return baseResponse.writeResponse(response, 200, tempXML, accept[0]);
    }
    return baseResponse.writeResponse(response, 200, JSON.stringify(list), 'application/json');
  });
};

// Responds with response headers for a list of templates request
// Params:
//  request - AJAX request object
//  Can contain an optional category query parameter for filtering results
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getTemplateListHead = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);

  const queryStr = { 'elements.attributes.category': params.category };
  const filter = (params.category) ? queryStr : {};

  return mongoHandler.dbGet('templates', filter, (err, list) => {
    if (err) {
      return baseResponse.writeError(response, 500, accept, err.message);
    }

    const count = list.length;

    response.setHeader('count', count);

    if (accept[0] === 'text/xml') {
      return baseResponse.writeResponseHead(response, 200, accept[0]);
    }
    return baseResponse.writeResponseHead(response, 200, 'application/json');
  });
};

// Responds with example XML and JSON bodies for the addTemplate function
// Params:
//  request - AJAX request object
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getExample = (request, response, accept) => {
  const exampleXML = '<template name="example1" category="examples"><title>Example 1</title><line>This is a <blank type="adjective"/> example.</line></template>';

  if (accept[0] === 'text/xml') {
    return baseResponse.writeResponse(response, 200, exampleXML, accept[0]);
  }
  return baseResponse.writeResponse(response, 200, xmljs.xml2json(exampleXML), 'application/json');
};

// Responds with header information for example XML and JSON response
// Params:
//  request - AJAX request object
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getExampleHead = (request, response, accept) => baseResponse.writeResponseHead(response, 200, (accept[0] === 'text/xml' ? accept[0] : 'application/json'));

// Responds with a sheet, game data on an instance of a game tempalte/saved game
// Params:
//  request - AJAX request object
//  Needs to provide 'name' and 'template' query params to select a 'sheet'
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getGame = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);
  if (!params.name || !params.template) {
    return baseResponse.writeError(response, 400, accept, `Missing required query parameter(s): ${(!params.name) ? 'name' : ''}${(!params.name && !params.template) ? ', ' : ''}${(!params.template) ? 'template' : ''}.`);
  }

  const filter = { $and: [{ name: params.name }, { template: params.template }] };
  return mongoHandler.dbGet('sheets', filter, (err, result) => {
    if (err) {
      return baseResponse.writeError(response, 500, accept, err.message);
    }
    if (result.length < 1) {
      return baseResponse.writeError(response, 404, accept, 'The requested saved sheet could not be found.');
    }

    const sheet = result[0];
    if (accept[0] === 'text/xml') {
      const tempXML = getFormatedSheet(sheet);
      return baseResponse.writeResponse(response, 200, tempXML, accept[0]);
    }
    return baseResponse.writeResponse(response, 200, JSON.stringify(sheet), 'application/json');
  });
};

// Responds with the header info for a sheet, game data on an instance of a game tempalte/saved game
// Params:
//  request - AJAX request object
//  Needs to provide 'name' and 'template' query params to select a 'sheet'
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getGameHead = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);
  if (!params.name || !params.template) {
    return baseResponse.writeErrorHead(response, 400, accept);
  }
  const filter = { $and: [{ name: params.name }, { template: params.template }] };
  return mongoHandler.dbGet('sheets', filter, (err, result) => {
    if (err) {
      return baseResponse.writeError(response, 500, accept, err.message);
    }
    if (result.length < 1) {
      return baseResponse.writeErrorHead(response, 404, accept);
    }

    if (accept[0] === 'text/xml') {
      return baseResponse.writeErrorHead(response, 200, accept[0]);
    }
    return baseResponse.writeErrorHead(response, 200, 'application/json');
  });
};

// Adds a 'sheet'/game instance//Params:
//  request - AJAX request object
//  Needs to provide a body in the response
//  XML:
//    <sheet><name>text</name>
//        <template>text</template>
//        <words>
//            <word0>text</word0>
//            <word1>text</word1>
//            ... etc.
//        </words>
//    </sheet>
//  JSON:
//    {"name":"","template":"","words":{"word0":"","word1":"",...}}
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const addGame = (request, response, accept) => {
  parseBody(request, response, accept, (body) => {
    try {
      const bodyString = Buffer.concat(body).toString();

      let jsonObj = {};
      if (request.headers['content-type'] && request.headers['content-type'] === 'text/xml') {
        const xmlObj = bodyString;
        const tempJSON = JSON.parse(xmljs.xml2json(xmlObj, { compact: true }));

        // Validating object
        if (!tempJSON.sheet.name) {
          return baseResponse.writeError(response, 400, accept, 'The request object is missing a name element.');
        }
        if (!tempJSON.sheet.template) {
          return baseResponse.writeError(response, 400, accept, 'The request object is missing a template element.');
        }
        if (!tempJSON.sheet.words) {
          return baseResponse.writeError(response, 400, accept, 'The request object is missing the words element.');
        }
        jsonObj.name = tempJSON.sheet.name._text;
        jsonObj.template = tempJSON.sheet.template._text;
        jsonObj.words = {};

        // Solving no-restricted-synax error
        // Based on:
        // https://stackoverflow.com/questions/43807515/eslint-doesnt-allow-for-in
        const entries = Object.entries(tempJSON.sheet.words);
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];

          jsonObj.words[entry[0]] = entry[1]._text;
        }
      } else {
        jsonObj = JSON.parse(bodyString);
        // Validating object
        if (!jsonObj.name) {
          return baseResponse.writeError(response, 400, accept, 'The request object is missing a name element.');
        }
        if (!jsonObj.template) {
          return baseResponse.writeError(response, 400, accept, 'The request object is missing a template element.');
        }
        if (!jsonObj.words) {
          return baseResponse.writeError(response, 400, accept, 'The request object is missing the words element.');
        }
      }

      const keys = Object.keys(jsonObj.words);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== `word${i}`) {
          const msg = `Unexpected key - ${keys[i]}: expected word${i}`;
          return baseResponse.writeError(response, 400, accept, msg);
        }
      }
      const filter = { name: jsonObj.name, template: jsonObj.template };
      return mongoHandler.dbAdd('sheets', filter, jsonObj, (err, result) => {
        if (err) {
          return baseResponse.writeError(response, 500, accept, err.message);
        }
        if (result.matchedCount === 0) {
          return baseResponse.writeError(response, 201, accept);
        }
        return baseResponse.writeErrorHead(response, 204, accept);
      });
    } catch (e) {
      // When an error is encountered, send a 400 error
      return baseResponse.writeError(response, 400, accept, e.message);
    }
  });
};

// Responds with a list of 'sheets' (saved games)
// Params:
//  request - AJAX request object
//  Can contain an optional template query parameter for filtering results
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getGameList = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);

  const filter = (params.template) ? { template: params.template } : {};

  return mongoHandler.dbGet('sheets', filter, (err, result) => {
    const count = result.length;

    response.setHeader('count', count);

    const list = result;

    if (accept[0] === 'text/xml') {
      let tempXML = '<sheets>';
      for (let i = 0; i < count; i++) {
        tempXML = `${tempXML}${getFormatedSheet(list[i])}`;
      }
      tempXML = `${tempXML}</sheets>`;
      return baseResponse.writeResponse(response, 200, tempXML, accept[0]);
    }
    return baseResponse.writeResponse(response, 200, JSON.stringify(list), 'application/json');
  });
};

// Responds with response headers for a list of 'sheet' (saved game) request
// Params:
//  request - AJAX request object
//  Can contain an optional template query parameter for filtering results
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getGameListHead = (request, response, accept) => {
  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);

  const filter = (params.template) ? { template: params.template } : {};

  return mongoHandler.dbGet('sheets', filter, (err, result) => {
    const count = result.length;

    response.setHeader('count', count);

    if (accept[0] === 'text/xml') {
      return baseResponse.writeResponseHead(response, 200, accept[0]);
    }
    return baseResponse.writeResponseHead(response, 200, 'application/json');
  });
};

// Export modules
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
