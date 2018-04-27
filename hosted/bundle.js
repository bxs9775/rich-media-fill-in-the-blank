"use strict";

/*Form events*/
//Handles the ajax call to change a user's password
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
//Creates the account page for a user
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
        "div",
        null,
        React.createElement(
          "label",
          { htmlfor: "oldpass" },
          "Current password:"
        ),
        React.createElement("input", { id: "oldpass", type: "text", name: "oldpass", placeholder: "password" })
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "label",
          { htmlFor: "pass" },
          "New Password: "
        ),
        React.createElement("input", { id: "pass", type: "text", name: "pass", placeholder: "password" })
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "label",
          { htmlFor: "pass2" },
          "Retype New Password: "
        ),
        React.createElement("input", { id: "pass2", type: "text", name: "pass2", placeholder: "retype password" })
      ),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { className: "formSubmit", type: "submit", value: "Change Password" })
    ),
    React.createElement("div", { id: "passChangeError", className: "errorDisp" })
  );
};

/*React generation*/
//Renders the account page for a user.
var generateAccountPage = function generateAccountPage(csrf) {
  ReactDOM.render(React.createElement(AccountPage, { csrf: csrf }), document.querySelector('#content'));
};
"use strict";

/*Startup*/
//Sets up the app page when first navigating to it
//Automatically displays the template search page.
var setup = function setup(csrf) {
  var searchButton = document.querySelector("#templateSearchButton");
  var newTemplateButton = document.querySelector("#newTemplateButton");
  var donateButton = document.querySelector("#donateButton");
  var accountButton = document.querySelector("#accountButton");
  var body = document.querySelector("body");

  //Sets up navigation to the search page
  searchButton.addEventListener("click", function (e) {
    e.preventDefault();
    getToken(generateTemplateSearchPage, {});
    return false;
  });

  //Sets up navigation to the new template page
  newTemplateButton.addEventListener("click", function (e) {
    e.preventDefault();
    getToken(generateNewTemplatePage, {});
    return false;
  });

  //sets up navigation to the donate page
  donateButton.addEventListener("click", function (e) {
    e.preventDefault();
    generateDonationPage();
    return false;
  });

  //sets up navigation to the account page
  accountButton.addEventListener("click", function (e) {
    e.preventDefault();
    getToken(generateAccountPage, {});
    return false;
  });

  //handles the closing of all the error messages
  body.addEventListener("click", function (e) {
    return closeAllErrors();
  });

  //navigates to the search page
  generateTemplateSearchPage(csrf);
};

$(document).ready(function () {
  getToken(setup, {});
});
"use strict";

/*Helper Methods*/
//onClick code for a disabled link
var disabledLink = function disabledLink(e) {
  e.preventDefault();
  return false;
};

/*React elements*/
//creates the donation page
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
//displays the donation page in the website
var generateDonationPage = function generateDonationPage() {
  ReactDOM.render(React.createElement(DonationPage, null), document.querySelector('#content'));
};
"use strict";

/*Form events*/
//handles the Ajax for creating a new template
var handleTemplateSubmission = function handleTemplateSubmission(e) {
  e.preventDefault();

  var errDisp = document.querySelector("#addError");

  //Checks for missing fields
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

  //creates the data object
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

  //parses the content section for the server
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

  //send the request
  sendAjax('POST', $("#newTemplateForm").attr("action"), JSON.stringify(data), "application/json", errDisp, function (data) {
    handleError("Template added!", errDisp);
  });

  return false;
};

/*React elements*/
// constructs a new template form
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
        { className: "info" },
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
//renders a new template form on the page
var generateNewTemplatePage = function generateNewTemplatePage(csrf) {
  ReactDOM.render(React.createElement(NewTemplateForm, { csrf: csrf }), document.querySelector('#content'));
};
"use strict";

/*Helper functions*/
// updates the current template view with the new game data
var populateGameData = function populateGameData(e, template, game) {
  e.preventDefault();

  var words = JSON.parse(JSON.stringify(game)).words;

  if (document.querySelector("#fullView")) {
    generateTemplateFullView(template, words);
  } else {
    generateTemplateListView(template, words);
  }
  return false;
};

// sends an Ajax request to get the usernames
// given specified ids
var getUsernames = function getUsernames(csrf, ids, callback) {
  var data = "id=" + ids;
  if (Array.isArray(ids)) {
    if (ids.length < 1) {
      return callback([]);
    }
  }
  data = data + "&_csrf=" + csrf;
  return sendAjax('GET', "/usernames", data, null, null, function (usernames) {
    callback(usernames);
  });
};

/*Form events*/
// handles Ajax request to save the game data
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

  sendAjax('POST', $("#saveForm").attr("action"), data, null, errDisp, function (info) {
    handleError("Game saved!", errDisp);
  });

  return false;
};

// handles Ajax request to load saved games associated with the template
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

// handles the Ajax request to share the template with a user
var shareTemplate = function shareTemplate(e, template) {
  e.preventDefault();

  var errDisp = document.querySelector("#searchResults");

  sendAjax('POST', $("#shareForm").attr("action"), $("#shareForm").serialize(), null, errDisp, function (data) {
    handleError("Template is shared.", errDisp);
    var user = $("#shareUser").val();
    if (template.shared) {
      template.shared.push(user);
    } else {
      template.shared = [user];
    }
    getToken(generateShareForm, { template: template });
  });

  return false;
};

/*React elements*/
// JSX for displaying all the information in a template
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

// JSX for displaying a list of the template's blanks
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

// creates a page for a template
var TemplatePage = function TemplatePage(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      { id: "templateInfo", className: "hidden" },
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
      React.createElement("div", { className: "menuForm", id: "share" }),
      React.createElement("div", { id: "searchResults", className: "errorDisp" })
    )
  );
};

// creates JSX for the results of loading saved game data
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

// creates the form for saving game data
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

// creates the form for loading game data
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

// displays a list of users the template is shared with
var ShareDetails = function ShareDetails(props) {
  var usernames = props.usernames;

  var userList = {};

  if (Array.isArray(usernames)) {
    if (usernames.length < 1) {
      userList = React.createElement(
        "div",
        null,
        "(No one...)"
      );
    } else {
      userList = usernames.map(function (name) {
        return React.createElement(
          "div",
          null,
          name
        );
      });
    }
  } else {
    userList = React.createElement(
      "div",
      null,
      usernames
    );
  }

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      null,
      "Template shared with:"
    ),
    userList
  );
};

//creates the form for sharing the template
var ShareForm = function ShareForm(props) {
  var shareAction = function shareAction(e) {
    return shareTemplate(e, props.template);
  };

  return React.createElement(
    "div",
    null,
    React.createElement("div", { id: "shareInfo" }),
    React.createElement(
      "form",
      { id: "shareForm",
        onSubmit: shareAction,
        action: "/share",
        method: "POST" },
      React.createElement(
        "label",
        { htmlfor: "user" },
        "Share template with user:"
      ),
      React.createElement("input", { id: "shareUser", type: "text", name: "user" }),
      React.createElement("input", { type: "hidden", name: "_id", value: props.template._id }),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { type: "submit", value: "Share Template" })
    )
  );
};

/*React generation*/
// renders the full view of the template
var generateTemplateFullView = function generateTemplateFullView(template, save) {
  ReactDOM.render(React.createElement(TemplateFullView, { template: template, save: save }), document.querySelector('#templateView'));
};

// renders the list view of the template
var generateTemplateListView = function generateTemplateListView(template, save) {
  ReactDOM.render(React.createElement(TemplateListView, { template: template, save: save }), document.querySelector('#templateView'));
};

// renders a form for saving game data
var generateSaveForm = function generateSaveForm(csrf) {
  ReactDOM.render(React.createElement(SaveForm, { csrf: csrf }), document.querySelector("#saveGame"));
};

// renders a form for loading game data
var generateLoadForm = function generateLoadForm(csrf, data) {
  ReactDOM.render(React.createElement(LoadForm, { csrf: csrf, template: data.template }), document.querySelector("#loadGame"));
};

// renders the details on who the template is shared with
var generateShareDetails = function generateShareDetails(usernames) {
  ReactDOM.render(React.createElement(ShareDetails, { usernames: usernames }), document.querySelector("#shareInfo"));
};

// renders a form for sharing templates
var generateShareForm = function generateShareForm(csrf, data) {
  ReactDOM.render(React.createElement(ShareForm, { csrf: csrf, template: data.template }), document.querySelector("#share"));
  var usernames = data.template.shared;
  generateShareDetails(usernames);
};

// renders the page for the selected template in the website
var generateTemplatePage = function generateTemplatePage(e, template) {
  e.preventDefault();

  ReactDOM.render(React.createElement(TemplatePage, { template: template }), document.querySelector('#content'));

  getToken(generateSaveForm, {});
  getToken(generateLoadForm, { template: template });
  var currUser = $("#currentUser").text();
  if (currUser === template.user && !template.public) {
    var getUsers = function getUsers(csrf, data) {
      return getUsernames(csrf, data.template.shared, function (usernames) {
        template.shared = [];
        if (usernames && usernames.usernames) {
          template.shared = usernames.usernames.map(function (user) {
            return user.username;
          });
        }
        getToken(generateShareForm, { template: data.template });
      });
    };
    getToken(getUsers, { template: template });
  }
  generateTemplateListView(template, []);

  return false;
};
"use strict";

/* Form Events */
// handles the Ajax request for a template search
var handleSearch = function handleSearch(e) {
  e.preventDefault();

  sendAjax('GET', $("#searchForm").attr("action"), $("#searchForm").serialize(), null, document.querySelector('#searchResults'), function (data) {
    ReactDOM.render(React.createElement(TemplateResults, { templates: data.templates }), document.querySelector('#searchResults'));
    document.querySelector('#searchResults').style.height = "auto";
  });

  return false;
};

// runs the Ajax for the default search that is displayed when the page opens
var displayDefaultResults = function displayDefaultResults() {
  sendAjax('GET', '/templateList', "sort=createdDate&direction=descending&limit=5", null, document.querySelector('#searchResults'), function (data) {
    ReactDOM.render(React.createElement(TemplateResults, { templates: data.templates }), document.querySelector('#searchResults'));
    document.querySelector('#searchResults').style.height = "auto";
  });
};

/* React Elements */
// creates the template search results
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

    var access = [];
    access.push(React.createElement(
      "span",
      null,
      "Access: ",
      publicStr
    ));
    var currId = $('#currentId').text();
    if (template.shared.includes(currId)) {
      access.push(React.createElement(
        "span",
        null,
        " (Shared with you)"
      ));
    }

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
          access
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

// creates the form for performing a template search
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
      React.createElement(
        "label",
        { htmlFor: "limit" },
        "Limit: "
      ),
      React.createElement("input", { id: "limit", type: "number", min: "1", max: "50", name: "limit" }),
      React.createElement(
        "label",
        { htmlFor: "sort" },
        "Sort by: "
      ),
      React.createElement(
        "select",
        { name: "sort" },
        React.createElement(
          "option",
          { value: "createdDate", selected: true },
          "created date"
        ),
        React.createElement(
          "option",
          { value: "name" },
          "name"
        ),
        React.createElement(
          "option",
          { value: "category" },
          "category"
        ),
        React.createElement(
          "option",
          { value: "owner" },
          "owner"
        )
      ),
      React.createElement(
        "select",
        { name: "direction" },
        React.createElement(
          "option",
          { value: "ascending" },
          "ascending"
        ),
        React.createElement(
          "option",
          { value: "descending", selected: true },
          "descending"
        ),
        "\\"
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
// renders the template search form to the page
var generateTemplateSearchPage = function generateTemplateSearchPage(csrf) {
  ReactDOM.render(React.createElement(TemplateSearchForm, { csrf: csrf }), document.querySelector('#content'));
  document.querySelector("#limit").value = 5;
  displayDefaultResults();
};
"use strict";

//Error window closing
var closeElement = function closeElement(element) {
  $(element).css("height", "0");
  $(element).css("border-width", "0px");
};

var closeAllErrors = function closeAllErrors() {
  var errorDisps = Object.values(document.querySelectorAll(".errorDisp"));
  var count = errorDisps.length;

  for (var i = 0; i < count; i++) {
    var error = errorDisps[i];
    if (error.style.height !== "0px") {
      var numDivs = Object.values(error.querySelectorAll("div")).length;
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
