const http = require('http');
const url = require('url');

const webResponse = require('./webResponse.js');
const dataResponse = require('./dataResponse.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

//struct mapping endpoint urls to their specified functions
const endpoints = {
  GET: {
    '/': webResponse.getIndex,
    '/styles.css': webResponse.getCss,
    '/bundle.js': webResponse.getJavascript,
    '/template': dataResponse.getTemplate,
    '/templateList': dataResponse.getTemplateList,
    '/sheet': dataResponse.getGame,
    '/example': dataResponse.getExample,
    '/exampleJSON': dataResponse.getExample,
    '/exampleXML': dataResponse.getExample,
  },
  HEAD: {
    '/template': dataResponse.getTemplateHead,
    '/templateList': dataResponse.getTemplateListHead,
    '/sheet': dataResponse.getGameHead,
    '/example': dataResponse.getExampleHead,
    '/exampleJSON': dataResponse.getExampleHead,
    '/exampleXML': dataResponse.getExampleHead,
  },
  POST: {
    '/template': dataResponse.addTemplate,
    '/sheet': dataResponse.addGame,
  },
  notFound: webResponse.getNotFound,
};

//for working with a tags with a download target, I couldn't find a way to run an accept header and preserve the required behavior.
//this struct lists endpoints that will not include accept headers and will give a 'fake' header
const acceptExceptions = {
    '/exampleJSON': ['application/json'],
    '/exampleXML': ['text/xml'],
}

// responds to user request
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  const { method } = request;
  const { pathname } = parsedUrl;
  let accept = [];
  //if we need to mock in an accept header, like if we are trying to use a link use that instead of trying to grab accept headers
  if(acceptExceptions[pathname]){
    accept = acceptExceptions[pathname]
  }else{
    accept = request.headers.accept.split(',');
  }

  if (endpoints[method] && endpoints[method][pathname]) {
    endpoints[method][pathname](request, response, accept);
  } else {
    endpoints.notFound(request, response, accept);
  }
};

// sets up the server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
