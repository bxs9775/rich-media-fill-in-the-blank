// responses for xml, css, and javascript
// imports
const fs = require('fs');
const baseResponse = require('./baseResponse.js');

const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
const css = fs.readFileSync(`${__dirname}/../hosted/styles.css`);
const clientBundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);

const getIndex = (request, response) => {
  baseResponse.writeResponse(response, 200, index, 'text/html');
};

const getCss = (request, response) => {
  baseResponse.writeResponse(response, 200, css, 'text/css');
};

const getJavascript = (request, response) => {
  baseResponse.writeResponse(response, 200, clientBundle, 'application/javascript');
};

const getNotFound = (request, response) => {
  if (request.method === 'HEAD') {
    baseResponse.writeErrorHead(response, 404, request.headers.accept.split(','));
  } else {
    baseResponse.writeError(response, 404, request.headers.accept.split(','));
  }
};

// export modules
module.exports = {
  getIndex,
  getCss,
  getJavascript,
  getNotFound,
};
