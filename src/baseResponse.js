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

const writeResponse = (response, error, content, type) => {
  response.writeHead(error, { 'content-type': type });
  response.write(content);
  response.end();
};

const writeResponseHead = (response, error, type) => {
  response.writeHead(error, { 'content-type': type });
  response.end();
};

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
