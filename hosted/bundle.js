"use strict";
'use strict';

//From DomoMaker

// Get a Cross Site Request Forgery(csrf) token
var getToken = function getToken(callback, data) {
  //console.log("Token called.");
  sendAjax('GET', '/getToken', null, function (result) {
    callback(result.csrfToken, data);
  });
};

//Handles error by displaying it on the page.
var handleError = function handleError(message, display) {
  display.text(message);
};

//Redirects the client to the given page.
var redirect = function redirect(response) {
  window.location = response.redirect;
};

//Handles AJAX calls to the server
var sendAjax = function sendAjax(type, action, data, success, errorDisplay) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error, errorDisplay);
    }
  });
};
