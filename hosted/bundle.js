"use strict";

/*Helper functions*/

/*Form events*/
var handleSave = function handleSave(e) {
  e.preventDefault();

  var errDisp = document.querySelector("#searchResults");

  var blankList = document.querySelectorAll("#templateView input");
  console.dir(blankList);
  var words = Object.values(blankList).map(function (blank) {
    return blank.value;
  });

  var data = {
    name: "" + $("#saveName").val(),
    template: "" + $("#templateName").text(),
    _csrf: "" + $("#save_csrf").val(),
    words: words
  };

  console.dir(data);

  sendAjax('POST', $("#saveForm").attr("action"), JSON.stringify(data), "application/json", errDisp, function (data) {
    handleError("Game saved!", errDisp);
  });

  return false;
};

var handleLoad = function handleLoad(e) {
  e.preventDefault();

  var errDisp = document.querySelector("#searchResults");

  var data = "template=" + $("#templateName").text() + "&_csrf=" + $("#save_csrf").val();

  console.dir(data);

  sendAjax('GET', $("#loadForm").attr("action"), data, null, errDisp, function (data) {
    console.dir(data);
  });

  return false;
};

var handleSearch = function handleSearch(e) {
  e.preventDefault();

  sendAjax('GET', $("#searchForm").attr("action"), $("#searchForm").serialize(), null, document.querySelector('#searchResults'), function (data) {
    ReactDOM.render(React.createElement(TemplateResults, { templates: data.templates }), document.querySelector('#searchResults'));
  });

  return false;
};

var handleTemplateSubmission = function handleTemplateSubmission(e) {
  e.preventDefault();

  console.dir("_csrf:" + $("#temp_csrf").val());

  var errDisp = document.querySelector("#addError");
  if ($("#tempName").val() === "") {
    handleError("Name is required.", errDisp);
    return false;
  }
  if ($("#tempCategory").val() === "") {
    handleError("Name is required.", errDisp);
    return false;
  }
  if ($("#tempContent").val() === "") {
    handleError("Content is required.", errDisp);
    return false;
  }

  var data = {
    name: "" + $("#tempName").val(),
    category: "" + $("#tempCategory").val(),
    public: $("#tempFilter").val(),
    _csrf: "" + $("#temp_csrf").val()
  };
  /*
  let data = `name=${$("#tempName").val()}`;
  data = `${data}&template:${$("#tempCategory").val()}`;
  data = `${data}&filter:${$("#tempFilter").val()}`;
  data = `${data}&_csrf:${$("#temp_csrf").val()}`;
  */

  var content = {};
  var contentStr = "" + $("#tempContent").val();
  //Split on newline
  //Regex from https://stackoverflow.com/questions/21895233/how-in-node-to-split-string-by-newline-n
  var contentArr = contentStr.split(/\r?\n/);

  for (var i = 0; i < contentArr.length; i++) {
    var line = contentArr[i];
    var element = {};
    if (line.charAt(0) === '>') {
      element.type = 'title';
      line = line.substring(1);
    } else {
      element.type = 'line';
    }
    var blankStart = line.indexOf('[');
    var blankEnd = line.indexOf(']');
    var nextSpot = 0;
    element.content = {};

    while (blankStart >= 0) {

      if (blankEnd < 0) {
        handleError("Found '[' without a closing ']'.", errDisp);
        return false;
      }
      if (blankEnd - blankStart < 0) {
        handleError("Found ']' without a starting '['.", errDisp);
        return false;
      }
      var text = line.substring(0, blankStart);
      if (text.length > 0) {
        element.content["" + nextSpot] = {
          type: 'text',
          content: text
        };
        nextSpot++;
      }
      if (blankEnd - blankStart > 1) {
        var value = line.substring(blankStart + 1, blankEnd);
        element.content["" + nextSpot] = {
          type: 'blank',
          content: value
        };
        nextSpot++;
      }
      if (blankEnd + 1 > line.length) {
        line = "";
      } else {
        line = line.substring(blankEnd + 1);
      }
      blankStart = line.indexOf('[');
      blankEnd = line.indexOf(']');
    }
    if (line.length > 0) {
      element.content["" + nextSpot] = {
        type: 'text',
        content: line
      };
    }
    content["" + i] = element;
  }

  data.content = content;
  //data = `${data}&content=${JSON.stringify(content)}`;

  console.dir(data);

  sendAjax('POST', $("#newTemplateForm").attr("action"), JSON.stringify(data), "application/json", errDisp, function (data) {
    handleError("Template added!", errDisp);
  });

  return false;
};

/*React elements*/

var TemplateFullView = function TemplateFullView(props) {
  var template = props.template;
  var save = props.save;

  var action = function action(e) {
    e.preventDefault();
    generateTemplateListView(template, save);
    return false;
  };

  var nextBlank = 0;

  var content = [];
  var elements = Object.values(template.content);
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    //console.dir(element);

    var subcontent = [];
    var subelements = Object.values(element.content);

    for (var j = 0; j < subelements.length; j++) {
      var subelement = subelements[j];

      //console.dir(subelement);
      if (subelement.type === "blank") {
        var value = "";
        if (save && save[nextBlank]) {
          value = save[nextBlank];
        }

        var updateTempSave = function updateTempSave(e) {
          var target = e.target;
          var num = parseInt(target.name);
          save[num] = target.value;
          generateTemplateFullView(template, save);
        };

        subcontent.push(React.createElement("input", { name: "" + nextBlank, className: "blank", type: "text", placeholder: subelement.content, value: value, onChange: updateTempSave }));
        nextBlank++;
      } else {
        subcontent.push(React.createElement(
          "span",
          null,
          subelement.content
        ));
      }
    };
    if (element.type == "title") {
      content.push(React.createElement(
        "h3",
        null,
        subcontent
      ));
    } else {
      content.push(React.createElement(
        "p",
        null,
        subcontent
      ));
    }
  };

  return React.createElement(
    "div",
    { id: "fullView" },
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
  var save = props.save;

  var action = function action(e) {
    e.preventDefault();
    generateTemplateFullView(template, save);
    return false;
  };

  var nextBlank = 0;
  var blankList = [];

  var content = Object.values(template.content);

  var contentLength = content.length;
  for (var i = 0; i < contentLength; i++) {
    var subcontent = Object.values(content[i].content);
    var subcontentLength = subcontent.length;

    for (var j = 0; j < subcontentLength; j++) {
      var subelem = subcontent[j];

      if (subelem.type === "blank") {
        var value = "";
        if (save && save[nextBlank]) {
          value = save[nextBlank];
        }

        var updateTempSave = function updateTempSave(e) {
          var target = e.target;
          var num = parseInt(target.name);
          save[num] = target.value;
          generateTemplateListView(template, save);
        };

        blankList.push(React.createElement(
          "li",
          null,
          React.createElement(
            "label",
            { htmlfor: "" + nextBlank },
            subelem.content,
            ": "
          ),
          React.createElement("input", { name: "" + nextBlank, className: "blank", type: "text", placeholder: subelem.content, value: value, onChange: updateTempSave })
        ));

        nextBlank++;
      }
    };
  };

  return React.createElement(
    "div",
    { id: "listView" },
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
    React.createElement(
      "div",
      { id: "templateInfo", "class": "hidden" },
      React.createElement(
        "p",
        { id: "templateName" },
        props.template.name
      ),
      React.createElement(
        "p",
        { id: "templateCategory" },
        props.template.category
      )
    ),
    React.createElement("div", { id: "templateView" }),
    React.createElement(
      "div",
      { id: "templateMenu" },
      React.createElement("div", { className: "menuForm", id: "saveGame" }),
      React.createElement("div", { className: "menuForm", id: "loadGame" }),
      React.createElement("div", { id: "searchResults" })
    )
  );
};

var TemplateResults = function TemplateResults(props) {
  console.dir(props.templates);

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

  var templateList = props.templates.map(function (template) {
    var templateAction = function templateAction(e) {
      return generateTemplatePage(e, template);
    };

    return React.createElement(
      "div",
      null,
      React.createElement(
        "a",
        { className: "templateResult", href: "", onClick: templateAction },
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
            template.category
          )
        ),
        React.createElement(
          "p",
          null,
          "Public: ",
          template.public.toString()
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

var SaveForm = function SaveForm(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "form",
      { id: "saveForm",
        onSubmit: handleSave,
        action: "/game",
        method: "POST",
        enctype: "application/json" },
      React.createElement(
        "label",
        { htmlfor: "name" },
        "Name: "
      ),
      React.createElement("input", { id: "saveName", type: "text", name: "name", placeholder: "" }),
      React.createElement("input", { id: "save_csrf", type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { type: "submit", value: "Save Game" })
    )
  );
};

var LoadForm = function LoadForm(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "form",
      { id: "loadForm",
        onSubmit: handleLoad,
        action: "/gameList",
        method: "GET",
        enctype: "application/json" },
      React.createElement("input", { id: "load_csrf", type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { type: "submit", value: "Load Game" })
    )
  );
};

var NewTemplateForm = function NewTemplateForm(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "form",
      { id: "newTemplateForm",
        onSubmit: handleTemplateSubmission,
        action: "/template",
        method: "POST",
        enctype: "application/json" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "label",
          { htmlFor: "name" },
          "Name: "
        ),
        React.createElement("input", { id: "tempName", type: "text", name: "name", placeholder: "name" }),
        React.createElement(
          "label",
          { htmlFor: "category" },
          "Category: "
        ),
        React.createElement("input", { id: "tempCategory", type: "text", name: "category", placeholder: "category" }),
        React.createElement(
          "label",
          { htmlFor: "filter" },
          "Public:"
        ),
        React.createElement(
          "select",
          { id: "tempFilter", name: "filter" },
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
        )
      ),
      React.createElement(
        "label",
        { htmlFor: "content" },
        "Content:"
      ),
      React.createElement("textarea", { id: "tempContent", name: "content", className: "multiline", placeHolder: "Type here." }),
      React.createElement("input", { id: "temp_csrf", type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { type: "submit", value: "Create Template" })
    ),
    React.createElement("div", { id: "addError" })
  );
};

var TemplateSearchForm = function TemplateSearchForm(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
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
    ),
    React.createElement(
      "div",
      { id: "searchResults" },
      " "
    )
  );
};

/*React generation*/

var generateTemplateFullView = function generateTemplateFullView(template, save) {
  ReactDOM.render(React.createElement(TemplateFullView, { template: template, save: save }), document.querySelector('#templateView'));
};

var generateTemplateListView = function generateTemplateListView(template, save) {
  ReactDOM.render(React.createElement(TemplateListView, { template: template, save: save }), document.querySelector('#templateView'));
};

var generateSaveForm = function generateSaveForm(csrf) {
  ReactDOM.render(React.createElement(SaveForm, { csrf: csrf }), document.querySelector("#saveGame"));
};

var generateLoadForm = function generateLoadForm(csrf) {
  ReactDOM.render(React.createElement(LoadForm, { csrf: csrf }), document.querySelector("#loadGame"));
};

var generateTemplatePage = function generateTemplatePage(e, template) {
  e.preventDefault();

  console.log("Template:");
  console.dir(template);

  ReactDOM.render(React.createElement(TemplatePage, { template: template }), document.querySelector('#content'));

  getToken(generateSaveForm, document.querySelector("#searchResults"));
  getToken(generateLoadForm, document.querySelector("#searchResults"));
  generateTemplateListView(template, []);

  return false;
};

var generateNewTemplatePage = function generateNewTemplatePage(csrf) {
  ReactDOM.render(React.createElement(NewTemplateForm, { csrf: csrf }), document.querySelector('#content'));
};

var generateTemplateSearchPage = function generateTemplateSearchPage(csrf) {
  ReactDOM.render(React.createElement(TemplateSearchForm, { csrf: csrf }), document.querySelector('#content'));
};

/*Startup*/
var setup = function setup(csrf) {
  console.log("App setup called.");
  var searchButton = document.querySelector("#templateSearchButton");
  var newTemplateButton = document.querySelector("#newTemplateButton");

  searchButton.addEventListener("click", function (e) {
    e.preventDefault();
    getToken(generateTemplateSearchPage, {});
    return false;
  });

  newTemplateButton.addEventListener("click", function (e) {
    e.preventDefault();
    getToken(generateNewTemplatePage, {});
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
  sendAjax('GET', '/getToken', null, null, null, function (result) {
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
var sendAjax = function sendAjax(type, action, data, contType, errorDisplay, success) {
  console.dir(errorDisplay);
  handleError('', errorDisplay);

  var contentType = contType || "application/x-www-form-urlencoded; charset=UTF-8";

  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    contentType: contentType,
    success: success,
    error: function error(xhr, status, _error) {
      try {
        var messageObj = JSON.parse(xhr.responseText);
        handleError(messageObj.error, errorDisplay);
      } catch (e) {
        handleError("An error has occured.", errorDisplay);
      }
    }
  });
};
