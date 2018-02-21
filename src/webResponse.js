// responses for xml, css, and javascript
// imports
const fs = require('fs');
const baseResponse = require('./baseResponse.js');

const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
const css = fs.readFileSync(`${__dirname}/../hosted/styles.css`);
const clientBundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);

// Responds with the index file - 'client.html'
// Params:
//  request - AJAX request object
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getIndex = (request, response) => {
  baseResponse.writeResponse(response, 200, index, 'text/html');
};

// Responds with the css stypesheet - 'style.css'
// Params:
//  request - AJAX request object
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getCss = (request, response) => {
  baseResponse.writeResponse(response, 200, css, 'text/css');
};

// Responds with the client-side JavaScript file - 'bundle.js'
// Params:
//  request - AJAX request object
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getJavascript = (request, response) => {
  baseResponse.writeResponse(response, 200, clientBundle, 'application/javascript');
};

// Responds with a 404 Not Found error
// Params:
//  request - AJAX request object
//  response - a response object the server uses to send back info
//  accept - Accept headers array for determining content type
const getNotFound = (request, response, accept) => {
  if (request.method === 'HEAD') {
    baseResponse.writeErrorHead(response, 404, accept);
  } else {
    baseResponse.writeError(response, 404, accept);
  }
};

// export modules
module.exports = {
  getIndex,
  getCss,
  getJavascript,
  getNotFound,
};
