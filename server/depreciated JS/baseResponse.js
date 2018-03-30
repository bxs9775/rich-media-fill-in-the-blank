// functions for sending responses

// struct stores the messages and ids for common error codes
const errorCodes = {
  200: {
    message: 'The request is successful.',
  },
  201: {
    message: 'Content has been created successfully.',
  },
  400: {
    id: 'badRequest',
    message: 'The server has recieved a bad request.',
  },
  404: {
    id: 'notFound',
    message: 'The requested resource was not found.',
  },
  500: {
    id: 'internalServerError',
    message: 'The server encountered an internal server error.',
  },
  unexpected: {
    id: 'unexpectedError',
    message: 'The server has encountered an unexpected error.',
  },
};

// Handles a generic response with a response body
// Params:
//  response - a response object the server uses to send back info
//  error - the error code for response
//  content - content to be sent in the response body
//  type - the content type for the response
const writeResponse = (response, error, content, type) => {
  response.writeHead(error, { 'content-type': type });
  response.write(content);
  response.end();
};

// Handles a generic response with a response body
// Params:
//  response - a response object the server uses to send back info
//  error - the error code for response
//  type - the content type for the response
const writeResponseHead = (response, error, type) => {
  response.writeHead(error, { 'content-type': type });
  response.end();
};

// Sends an error with a response body
// Params:
//  response - a response object the server uses to send back info
//  error - the error code for response
//  accept - the content type(s) for the response
//  message - optional parameter, overides the default message for
//  the given error code
const writeError = (response, error, accept, message = null) => {
  let errorJSON = {};

  if (errorCodes[error]) {
    errorJSON = errorCodes[error];
  } else {
    errorJSON = errorCodes.unexpected;
  }

  if (message) {
    errorJSON.message = message;
  }

  if (accept[0] === 'text/xml') {
    let errorXML = '<response>';
    if (errorJSON.message) {
      errorXML = `${errorXML}<message>${errorJSON.message}</message>`;
    }
    if (errorJSON.id) {
      errorXML = `${errorXML}<id>${errorJSON.id}</id>`;
    }
    errorXML = `${errorXML}</response>`;

    writeResponse(response, error, errorXML, accept[0]);
  } else {
    writeResponse(response, error, JSON.stringify(errorJSON), 'application/json');
  }
};

// Sends an error without a response body
// Params:
//  response - a response object the server uses to send back info
//  error - the error code for response
//  accept - the content type(s) for the response
const writeErrorHead = (response, error, accept) => {
  if (accept[0] === 'text/xml') {
    writeResponseHead(response, error, accept[0]);
  } else {
    writeResponseHead(response, error, 'application/json');
  }
};

// export modules
module.exports = {
  writeResponse,
  writeResponseHead,
  writeError,
  writeErrorHead,
};
