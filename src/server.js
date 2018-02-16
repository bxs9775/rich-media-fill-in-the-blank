const http = require('http');
const url = require('url');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// responds to user request
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  console.dir(request.url);
};

// sets up the server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
