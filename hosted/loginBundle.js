"use strict";

//From DomoMaker
// Handles the login process
var handleLogin = function handleLogin(e) {
  e.preventDefault();

  var errDisp = document.querySelector("#loginError");

  if ($("#user").val() == '' || $("#pass").val() == '') {
    handleError("User and password are required", errDisp);
    return false;
  }

  console.log($("input[name=_csrf]").val());

  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), errDisp, redirect);

  return false;
};

// Handles the signup process
var handleSignup = function handleSignup(e) {
  e.preventDefault();

  var errDisp = document.querySelector("#loginError");

  if ($("user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("All fields are required", errDisp);
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords do not match", errDisp);
    return false;
  }

  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), errDisp, redirect);

  return false;
};

// Creates the login screen for the client
var LoginWindow = function LoginWindow(props) {
  return React.createElement(
    "form",
    { id: "loginForm", name: "loginForm",
      onSubmit: handleLogin,
      action: "/login",
      method: "POST",
      className: "mainForm"
    },
    React.createElement(
      "label",
      { htmlFor: "username" },
      "Username: "
    ),
    React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "username" }),
    React.createElement(
      "label",
      { htmlFor: "pass" },
      "Password: "
    ),
    React.createElement("input", { id: "pass", type: "text", name: "pass", placeholder: "password" }),
    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
    React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign In" })
  );
};

// Creates the signup screen for the client
var SignupWindow = function SignupWindow(props) {
  return React.createElement(
    "form",
    { id: "signupForm", name: "signupForm",
      onSubmit: handleSignup,
      action: "/signup",
      method: "POST",
      className: "mainForm"
    },
    React.createElement(
      "label",
      { htmlFor: "username" },
      "Username: "
    ),
    React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "username" }),
    React.createElement(
      "label",
      { htmlFor: "pass" },
      "Password: "
    ),
    React.createElement("input", { id: "pass", type: "text", name: "pass", placeholder: "password" }),
    React.createElement(
      "label",
      { htmlFor: "pass2" },
      "Password: "
    ),
    React.createElement("input", { id: "pass2", type: "text", name: "pass2", placeholder: "retype password" }),
    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
    React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign Up" })
  );
};

// Renders the Login Window
var createLoginWindow = function createLoginWindow(csrf) {
  ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector("#content"));
};

// Renders the Signup Window
var createSignupWindow = function createSignupWindow(csrf) {
  ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector("#content"));
};

//Sets up event listeners and takes the user to the login 'page'
var setup = function setup(csrf) {
  console.log("Login setup called.");
  var signupButton = document.querySelector("#signupButton");
  var loginButton = document.querySelector("#loginButton");

  signupButton.addEventListener("click", function (e) {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });

  loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });

  createLoginWindow(csrf); //default view
};

//Runs setup when the document is opened.
$(document).ready(function () {
  getToken(setup, {});
});
'use strict';

//From DomoMaker
// Get a Cross Site Request Forgery(csrf) token
var getToken = function getToken(callback, data) {
  //console.log("Token called.");
  sendAjax('GET', '/getToken', null, null, function (result) {
    callback(result.csrfToken, data);
  });
};

//Handles error by displaying it on the page.
var handleError = function handleError(message, display) {
  //console.log(message);
  //console.dir(display);
  if (display) {
    $(display).text(message);
  } else {
    console.log(message);
  }
};

//Redirects the client to the given page.
var redirect = function redirect(response) {
  window.location = response.redirect;
};

//Handles AJAX calls to the server
var sendAjax = function sendAjax(type, action, data, errorDisplay, success) {
  console.dir(errorDisplay);
  handleError('', errorDisplay);

  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      console.dir(xhr.responseText);
      var message = "An error occured.";
      if (xhr.responseXML) {
        var messageObj = JSON.parse(xhr.responseText);
        message = messageObj.error;
      }
      handleError(message, errorDisplay);
    }
  });
};
