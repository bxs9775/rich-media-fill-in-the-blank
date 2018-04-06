"use strict";

/*Helper functions*/

/*Form events*/
var handleSearch = function handleSearch(e) {
  e.preventDefault();

  sendAjax('GET', $("#searchForm").attr("action"), $("#searchForm").serialize(), document.querySelector('#searchResults'), function () {
    ReactDOM.render(React.createElement(TemplateResults, { templates: data.templates }), document.querySelector('#searchResults'));
  });

  return false;
};

/*React elements*/

var TemplateFullView = function TemplateFullView(props) {
  var template = props.template;

  var action = function action(e) {
    e.preventDefault();
    generateTemplateListView(template);
    return false;
  };

  var content = template.content.map(function (element) {
    var subcontent = element.map(function (subelement) {
      if (subelement.type === "blank") {
        return React.createElement("input", { className: "blank", type: "text", placeholder: subelement.content });
      }
      return React.createElement(
        "span",
        null,
        subelement.content
      );
    });
    if (element.type == "title") {
      return React.createElement(
        "h3",
        null,
        subcontent
      );
    }
    return React.createElement(
      "p",
      null,
      subcontent
    );
  });

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      null,
      React.createElement(
        "a",
        { href: "", onClick: action },
        "Show list view."
      )
    ),
    React.createElement(
      "div",
      null,
      content
    )
  );
};

var TemplateListView = function TemplateListView(props) {
  var template = props.template;

  var action = function action(e) {
    e.preventDefault();
    generateTemplateFullView(template);
    return false;
  };

  var blankList = [];
  var content = Object.entries(template.content);
  var contentLength = content.length;
  for (var i = 0; i < contentLength; i++) {
    var subcontent = Object.entries(content.content);
    var subcontentLength = subcontent.length;

    for (var j = 0; j < subcontentLength; j++) {
      if (subcontent[j].type === "blank") {
        blankList.push(React.createElement(
          "li",
          null,
          React.createElement("input", { className: "blank", type: "text", placeholder: subcontent[j].content })
        ));
      }
    };
  };

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      null,
      React.createElement(
        "a",
        { href: "", onClick: action },
        "Show full view."
      )
    ),
    React.createElement(
      "div",
      null,
      React.createElement(
        "ol",
        null,
        blankList
      )
    )
  );
};

var TemplatePage = function TemplatePage(props) {
  return React.createElement(
    "div",
    null,
    React.createElement("div", { id: "templateView" }),
    React.createElement(
      "section",
      { id: "templateMenu" },
      React.createElement("div", { className: "menuForm", id: "saveTemplate" }),
      React.createElement("div", { className: "menuForm", id: "loadTemplate" }),
      React.createElement("div", { id: "searchResults" })
    )
  );
};

var TemplateResults = function TemplateResults(props) {
  if (props.templates.length === 0) {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "p",
        null,
        "No results found."
      )
    );
  };

  var TemplateList = rops.templates.map(function (template) {
    var templateAction = function templateAction(e) {
      generateTemplatePage(template);
    };

    return React.createElement(
      "div",
      null,
      React.createElement(
        "a",
        { className: "templateResult", href: "", onclick: templateAction },
        React.createElement(
          "p",
          { className: "nameAndCategory" },
          React.createElement(
            "span",
            null,
            "Name: ",
            template.name
          ),
          React.createElement(
            "span",
            null,
            "Category: ",
            template.name
          )
        ),
        React.createElement(
          "p",
          null,
          "Public: ",
          template.public
        )
      )
    );
  });

  return React.createElement(
    "div",
    null,
    templateList
  );
};

var NewTemplateForm = function NewTemplateForm(props) {
  return React.createElement(
    "form",
    { id: "newTemplateForm",
      action: "/template",
      method: "POST" },
    React.createElement(
      "label",
      { htmlFor: "name" },
      "Name: "
    ),
    React.createElement("input", { type: "text", name: "name", placeholder: "name" }),
    React.createElement(
      "label",
      { htmlFor: "category" },
      "Category: "
    ),
    React.createElement("input", { type: "text", name: "category", placeholder: "category" }),
    React.createElement(
      "label",
      { htmlFor: "filter" },
      "Public:"
    ),
    React.createElement(
      "select",
      { name: "filter" },
      React.createElement(
        "option",
        { value: "false", selected: true },
        "false"
      ),
      React.createElement(
        "option",
        { value: "true" },
        "true"
      )
    ),
    React.createElement("textarea", { name: "content", className: "multiline", placeHolder: "Type here." }),
    React.createElement("input", { type: "submit", value: "Create Template" })
  );
};

var TemplateSearchForm = function TemplateSearchForm(props) {
  return React.createElement(
    "form",
    { id: "searchForm",
      onSubmit: handleSearch,
      action: "/templateList",
      method: "GET" },
    React.createElement(
      "label",
      null,
      "Search:"
    ),
    React.createElement("input", { id: "searchInput", type: "text", name: "category" }),
    React.createElement(
      "label",
      { htmlFor: "filter" },
      "Filter: "
    ),
    React.createElement(
      "select",
      { name: "filter" },
      React.createElement(
        "option",
        { value: "all", selected: true },
        "all"
      ),
      React.createElement(
        "option",
        { value: "user" },
        "user"
      ),
      React.createElement(
        "option",
        { value: "public" },
        "public"
      )
    ),
    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
    React.createElement("input", { type: "submit", value: "Search Templates" })
  );
};

/*React generation*/
var generateTemplateFullView = function generateTemplateFullView(template) {
  ReactDOM.render(React.createElement(TemplateFullView, { template: template }), document.querySelector('#templateView'));
};

var generateTemplateListView = function generateTemplateListView(template) {
  ReactDOM.render(React.createElement(TemplateListView, { template: template }), document.querySelector('#templateView'));
};

var generateTemplatePage = function generateTemplatePage(template) {
  ReactDOM.render(React.createElement(TemplatePage, { template: template }), document.querySelector('#content'));
  generateTemplateListView(template);
};

var generateNewTemplatePage = function generateNewTemplatePage(csrf) {
  ReactDOM.render(React.createElement(NewTemplateForm, { csrf: csrf }), document.querySelector('#content'));
};

var generateTemplateSearchPage = function generateTemplateSearchPage(csrf) {
  var searchPage = React.createElement(
    "div",
    null,
    React.createElement(TemplateSearchForm, { csrf: csrf }),
    React.createElement("div", { id: "searchResults" })
  );
  ReactDOM.render(searchPage, document.querySelector('#content'));
};

/*Startup*/
var setup = function setup(csrf) {
  console.log("Login setup called.");
  var searchButton = document.querySelector("#templateSearchButton");
  var newTemplateButton = document.querySelector("#newTemplateButton");

  searchButton.addEventListener("click", function (e) {
    e.preventDefault();
    generateTemplateSearchPage(csrf);
    return false;
  });

  newTemplateButton.addEventListener("click", function (e) {
    e.preventDefault();
    generateNewTemplatePage(csrf);
    return false;
  });

  generateTemplateSearchPage(csrf);
};

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
  if (display) {
    ReactDOM.render(React.createElement(
      'span',
      { id: 'error' },
      message
    ), display);
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
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error, errorDisplay);
    }
  });
};
