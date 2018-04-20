"use strict";

/*Form events*/
var handleChangePassword = function handleChangePassword(e) {
  e.preventDefault();

  var errDisp = document.querySelector('#passChangeError');

  if ($("#oldpass").val() === "" || $("#pass").val() === "" || $("#pass2").val() === "") {
    handleError("All fields are required", errDisp);
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("New passwords do not match", errDisp);
    return false;
  }

  sendAjax('POST', $("#passChangeForm").attr("action"), $("#passChangeForm").serialize(), null, errDisp, function (data) {
    handleError("Your password has been changed.", errDisp);
  });

  return false;
};

/*React elements*/
var AccountPage = function AccountPage(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "h3",
      null,
      "Change password:"
    ),
    React.createElement(
      "form",
      { id: "passChangeForm",
        onSubmit: handleChangePassword,
        action: "/changePass",
        method: "POST"
      },
      React.createElement(
        "label",
        { htmlfor: "oldpass" },
        "Current password:"
      ),
      React.createElement("input", { id: "oldpass", type: "text", name: "oldpass", placeholder: "password" }),
      React.createElement(
        "label",
        { htmlFor: "pass" },
        "New Password: "
      ),
      React.createElement("input", { id: "pass", type: "text", name: "pass", placeholder: "password" }),
      React.createElement(
        "label",
        { htmlFor: "pass2" },
        "Retype New Password: "
      ),
      React.createElement("input", { id: "pass2", type: "text", name: "pass2", placeholder: "retype password" }),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { className: "formSubmit", type: "submit", value: "Change Password" })
    ),
    React.createElement("div", { id: "passChangeError", className: "errorDisp" })
  );
};

/*React generation*/
var generateAccountPage = function generateAccountPage(csrf) {
  ReactDOM.render(React.createElement(AccountPage, { csrf: csrf }), document.querySelector('#content'));
};
"use strict";

/*Startup*/
var setup = function setup(csrf) {
  var searchButton = document.querySelector("#templateSearchButton");
  var newTemplateButton = document.querySelector("#newTemplateButton");
  var donateButton = document.querySelector("#donateButton");
  var accountButton = document.querySelector("#accountButton");
  var body = document.querySelector("body");

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

  donateButton.addEventListener("click", function (e) {
    e.preventDefault();
    generateDonationPage();
    return false;
  });

  accountButton.addEventListener("click", function (e) {
    e.preventDefault();
    getToken(generateAccountPage, {});
    return false;
  });

  body.addEventListener("click", function (e) {
    return closeAllErrors();
  });

  generateTemplateSearchPage(csrf);
};

$(document).ready(function () {
  getToken(setup, {});
});
"use strict";

/*Helper Methods*/
var disabledLink = function disabledLink(e) {
  e.preventDefault();
  return false;
};

/*React elements*/
var DonationPage = function DonationPage(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "p",
      { className: "info" },
      "Note: This is not a real donation page. This project does not currently accept donations. This page displays a concept for a donation page that may be used if the site needs to start taking in donations to sustain further use."
    ),
    React.createElement(
      "p",
      null,
      "This Fill-In-The-Blanks game does not make any money from advertisements or payed subscriptions. All the funding for this project comes from donations. If you enjoy this service, please donate now so this site can keep running."
    ),
    React.createElement(
      "div",
      null,
      React.createElement(
        "a",
        { href: "", id: "donateNowLink", onClick: disabledLink
        },
        "Donate Now!"
      ),
      React.createElement(
        "span",
        null,
        " (Note: there is no donation site, this link doesn't go anywhare.)"
      )
    )
  );
};

/*React generation*/
var generateDonationPage = function generateDonationPage() {
  ReactDOM.render(React.createElement(DonationPage, null), document.querySelector('#content'));
};
"use strict";

/*Form events*/
var handleTemplateSubmission = function handleTemplateSubmission(e) {
  e.preventDefault();

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

  sendAjax('POST', $("#newTemplateForm").attr("action"), JSON.stringify(data), "application/json", errDisp, function (data) {
    handleError("Template added!", errDisp);
  });

  return false;
};

/*React elements*/
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
      React.createElement(
        "p",
        { classname: "info" },
        "Add the text of the game below. Press enter for new lines, type \">\" at the beginning of a line for headers, enclose blanks in brackets. ex. [noun] or [verb]"
      ),
      React.createElement("textarea", { id: "tempContent", name: "content", className: "multiline", placeHolder: "Type here." }),
      React.createElement("input", { id: "temp_csrf", type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { type: "submit", value: "Create Template" })
    ),
    React.createElement("div", { id: "addError", className: "errorDisp" })
  );
};

/*React rendering*/
var generateNewTemplatePage = function generateNewTemplatePage(csrf) {
  ReactDOM.render(React.createElement(NewTemplateForm, { csrf: csrf }), document.querySelector('#content'));
};
"use strict";

/*Helper functions*/
var populateGameData = function populateGameData(e, template, game) {
  e.preventDefault();

  if (document.querySelector("#fullView")) {
    generateTemplateFullView(template, game.words);
  } else {
    generateTemplateListView(template, game.words);
  }
  return false;
};

/*Form events*/
var handleSave = function handleSave(e) {
  e.preventDefault();

  var errDisp = document.querySelector("#searchResults");
  var blankList = document.querySelectorAll("#templateView input");

  var words = Object.values(blankList).map(function (blank) {
    return blank.value;
  });

  var data = {
    name: "" + $("#saveName").val(),
    template: "" + $("#templateName").text(),
    _csrf: "" + $("#save_csrf").val(),
    words: words
  };

  sendAjax('POST', $("#saveForm").attr("action"), JSON.stringify(data), "application/json", errDisp, function (data) {
    handleError("Game saved!", errDisp);
  });

  return false;
};

var handleLoad = function handleLoad(e, template) {
  e.preventDefault();

  var errDisp = document.querySelector("#searchResults");

  var data = "template=" + $("#templateName").text() + "&_csrf=" + $("#save_csrf").val();

  sendAjax('GET', $("#loadForm").attr("action"), data, null, errDisp, function (data) {
    ReactDOM.render(React.createElement(GameResults, { template: template, games: data.games }), document.querySelector('#searchResults'));
    document.querySelector('#searchResults').style.height = "auto";
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

    var subcontent = [];
    var subelements = Object.values(element.content);

    for (var j = 0; j < subelements.length; j++) {
      var subelement = subelements[j];
      var text = _.unescape(subelement.content);

      if (subelement.type === "blank") {
        var value = "";
        if (save && save[nextBlank]) {
          value = _.unescape(save[nextBlank]);
        }

        var updateTempSave = function updateTempSave(e) {
          var target = e.target;
          var num = parseInt(target.name);
          save[num] = target.value;
          generateTemplateFullView(template, save);
        };

        subcontent.push(React.createElement("input", { name: "" + nextBlank, className: "blank", type: "text", placeholder: text, value: value, onChange: updateTempSave }));
        nextBlank++;
      } else {
        subcontent.push(React.createElement(
          "span",
          null,
          text
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
        { href: "", className: "button", onClick: action },
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
        var text = _.unescape(subelem.content);
        var value = "";
        if (save && save[nextBlank]) {
          value = _.unescape(save[nextBlank]);
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
            text,
            ": "
          ),
          React.createElement("input", { name: "" + nextBlank, className: "blank", type: "text", placeholder: text, value: value, onChange: updateTempSave })
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
        { className: "button", href: "", onClick: action },
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
      React.createElement("div", { id: "searchResults", className: "errorDisp" })
    )
  );
};

var GameResults = function GameResults(props) {
  var template = props.template;
  var games = props.games;

  if (games.length === 0) {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "p",
        null,
        "No saved games found."
      )
    );
  };

  var gameList = games.map(function (game) {
    var gameAction = function gameAction(e) {
      return populateGameData(e, template, game);
    };
    return React.createElement(
      "div",
      { className: "saveResult" },
      React.createElement(
        "a",
        { href: "", className: "button", onClick: gameAction },
        game.name
      )
    );
  });

  return React.createElement(
    "div",
    null,
    gameList
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
  var loadGames = function loadGames(e) {
    return handleLoad(e, props.template);
  };

  return React.createElement(
    "div",
    null,
    React.createElement(
      "form",
      { id: "loadForm",
        onSubmit: loadGames,
        action: "/gameList",
        method: "GET",
        enctype: "application/json" },
      React.createElement("input", { id: "load_csrf", type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { type: "submit", value: "Load Game" })
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

var generateLoadForm = function generateLoadForm(csrf, data) {
  ReactDOM.render(React.createElement(LoadForm, { csrf: csrf, template: data.template }), document.querySelector("#loadGame"));
};

var generateTemplatePage = function generateTemplatePage(e, template) {
  e.preventDefault();

  ReactDOM.render(React.createElement(TemplatePage, { template: template }), document.querySelector('#content'));

  getToken(generateSaveForm, {});
  getToken(generateLoadForm, { template: template });
  generateTemplateListView(template, []);

  return false;
};
"use strict";

/* Form Events */
var handleSearch = function handleSearch(e) {
  e.preventDefault();

  sendAjax('GET', $("#searchForm").attr("action"), $("#searchForm").serialize(), null, document.querySelector('#searchResults'), function (data) {
    console.dir(data);
    ReactDOM.render(React.createElement(TemplateResults, { templates: data.templates }), document.querySelector('#searchResults'));
    document.querySelector('#searchResults').style.height = "auto";
  });

  return false;
};

/* React Elements */
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

  var templateList = props.templates.map(function (template) {
    var templateAction = function templateAction(e) {
      return generateTemplatePage(e, template);
    };
    var publicStr = template.public ? "public" : "private";

    var name = _.unescape(template.name);
    var category = _.unescape(template.category);

    return React.createElement(
      "div",
      { className: "templateResult" },
      React.createElement(
        "a",
        { href: "", onClick: templateAction },
        React.createElement(
          "p",
          { className: "nameAndCategory" },
          React.createElement(
            "span",
            null,
            "Name: ",
            name
          ),
          React.createElement(
            "span",
            null,
            "Category: ",
            category
          )
        ),
        React.createElement(
          "p",
          null,
          React.createElement(
            "span",
            null,
            "User: ",
            template.user
          ),
          React.createElement(
            "span",
            null,
            "Access: ",
            publicStr
          )
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
        { htmlfor: "category" },
        "Category:"
      ),
      React.createElement("input", { id: "searchCategory", type: "text", name: "category" }),
      React.createElement(
        "label",
        { htmlfor: "user" },
        "User:"
      ),
      React.createElement("input", { id: "searchUser", type: "text", name: "user" }),
      React.createElement(
        "label",
        { htmlFor: "filter" },
        "Access: "
      ),
      React.createElement(
        "select",
        { name: "access" },
        React.createElement(
          "option",
          { value: "all", selected: true },
          "all"
        ),
        React.createElement(
          "option",
          { value: "private" },
          "private"
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
      { id: "searchResults", className: "errorDisp" },
      " "
    )
  );
};

/* React Generation */
var generateTemplateSearchPage = function generateTemplateSearchPage(csrf) {
  ReactDOM.render(React.createElement(TemplateSearchForm, { csrf: csrf }), document.querySelector('#content'));
};
"use strict";

//Error window closing
var closeElement = function closeElement(element) {
  $(element).css("height", "0");
  $(element).css("border-width", "0px");
};

var closeAllErrors = function closeAllErrors() {
  //console.log("Closing errors...");
  var errorDisps = Object.values(document.querySelectorAll(".errorDisp"));
  var count = errorDisps.length;
  //console.dir(errorDisps);

  for (var i = 0; i < count; i++) {
    var error = errorDisps[i];
    //console.dir(error);
    //console.dir(error.style.height);
    if (error.style.height !== "0px") {
      var numDivs = Object.values(error.querySelectorAll("div")).length;
      //console.dir(numDivs);
      if (numDivs <= 0) {
        closeElement(error);
      }
    }
  }
};

//From DomoMaker
// Get a Cross Site Request Forgery(csrf) token
var getToken = function getToken(callback, data) {
  sendAjax('GET', '/getToken', null, null, null, function (result) {
    callback(result.csrfToken, data);
  });
};

//Handles error by displaying it on the page.
var handleError = function handleError(message, display) {
  if (display) {
    $(display).css("height", "18pt");
    $(display).css("border-width", "1px");
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
