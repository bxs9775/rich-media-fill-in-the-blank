const http = require('http');
const url = require('url');

const webResponse = require('./webResponse.js');
const dataResponse = require('./dataResponse.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const endpoints = {
  GET: {
    '/': webResponse.getIndex,
    '/styles.css': webResponse.getCss,
    '/bundle.js': webResponse.getJavascript,
    '/template': dataResponse.getTemplate,
    '/templateList': dataResponse.getTemplateList,
    '/sheet': dataResponse.getGame,
  },
  HEAD: {
    '/template': dataResponse.getTemplateHead,
    '/templateList': dataResponse.getTemplateListHead,
    '/sheet': dataResponse.getGameHead,
  },
  POST: {
    '/template': dataResponse.addTemplate,
    '/sheet': dataResponse.addGame,
  },
  notFound: webResponse.getNotFound,
};

// responds to user request
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  const { method } = request;
  const { pathname } = parsedUrl;
  const accept = request.headers.accept.split(',');

  if (endpoints[method] && endpoints[method][pathname]) {
    endpoints[method][pathname](request, response, accept);
  } else {
    endpoints.notFound(request, response,accept);
  }
};

// sets up the server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
