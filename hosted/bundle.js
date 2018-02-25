'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  var templateList = {};
  var content = void 0;
  var pageMenu = void 0;
  var subMenuListeners = [];

  // Declaring functions before they are initialized to avoid undeclared errors.
  // Control
  var sendRequest = function sendRequest() {};
  var handleResponse = function handleResponse() {};
  var init = function init() {};
  // Display
  var openPageMenu = function openPageMenu() {};
  var closePageMenu = function closePageMenu() {};
  var clearDisplayArea = function clearDisplayArea() {};
  var displayInfo = function displayInfo() {};
  var displayList = function displayList() {};
  var displaySheet = function displaySheet() {};
  var displayTemplatePage = function displayTemplatePage() {};
  var displayTemplateList = function displayTemplateList() {};
  var displayNewTemplatePage = function displayNewTemplatePage() {};
  var removeSubMenuListeners = function removeSubMenuListeners() {};

  // AJAX requests
  // Sends an AJAX request
  // Params:
  //  e - triggering event object
  //  form - the form object making the call
  //  (this field is given JSON with method and action for <a>)
  //  options - object containing optional headers, body, and
  //  query parameters
  //  display - an object used to display information from the response
  //  onResponse - method called after performing the basic handling of the request.
  sendRequest = function sendRequest(e, form, options, display, onResponse) {
    var action = form.action;
    var method = form.method;

    // Adds any query parameters

    if (options.params) {
      action = '' + action + options.params;
    }

    var xhr = new XMLHttpRequest();

    xhr.open(method, action);

    // If there is accept headers,
    // add them
    // else add 'accept':application/json'
    if (options.accept) {
      xhr.setRequestHeader('Accept', options.accept);
    } else {
      xhr.setRequestHeader('Accept', 'application/json');
    }

    // Add any optional headers
    if (options.headers) {
      for (var i = 0; i < options.headers.length; i++) {
        var header = options.headers[i];

        xhr.setRequestHeader(header.key, header.value);
      }
    }

    // Event listener for when xhr loads
    xhr.onload = function () {
      return handleResponse(xhr, display, onResponse);
    };

    // Add request body,
    // if there is one.
    // Send request
    if (options.body) {
      xhr.send(options.body);
    } else {
      xhr.send();
    }

    // Prevents page from changing
    e.preventDefault();
    return false;
  };

  // Display Functions
  // Removes event listeners from the template submenu
  removeSubMenuListeners = function removeSubMenuListeners() {
    var len = subMenuListeners.length;
    while (len > 0) {
      var listener = subMenuListeners[len - 1];
      var element = document.querySelector(listener.element);
      element.removeEventListener(listener.event, listener.function);
      subMenuListeners.pop();
      len--;
    }
  };

  // Opens the submenu when on an individual template page
  openPageMenu = function openPageMenu() {
    removeSubMenuListeners();
    content.style.width = '80%';
    pageMenu.style.display = 'block';
  };

  // Closes the submenu when on not an individual template page
  closePageMenu = function closePageMenu() {
    removeSubMenuListeners();
    content.style.width = '99%';
    pageMenu.style.display = 'none';
  };

  // Clears specified display area, removing all child nodes
  // Params:
  //  display - the html element to be cleared
  clearDisplayArea = function clearDisplayArea(display) {
    while (display.firstChild) {
      display.removeChild(display.firstChild);
    }
  };

  // Displays text information in the specified display.
  // Param:
  //  info - a text string you want displayed
  //  display - the html element to display info in
  displayInfo = function displayInfo(info, display) {
    var p = document.createElement('p');
    p.classList.add('info');
    p.textContent = info;
    display.appendChild(p);
  };

  // Handles displays a list of links based on the given array
  // Params:
  //  list - an object containing the array of information
  //  display - the html element to add the list elements to
  //  compact - whether the list is in a compact form or not
  //  if this vaule is true it is assumed the 'attributes' are
  //  on the top level of the list, if false the program tries to
  //  unwrap things
  //  action - the function that will be run when a link is clicked
  displayList = function displayList(list, display, compact, action) {
    clearDisplayArea(display);

    console.dir(list);

    var _loop = function _loop(i) {
      var attributes = compact ? list[i] : list[i].attributes;
      var para = document.createElement('p');
      var a = document.createElement('a');
      a.href = '';
      a.classList.add('listItem');

      // a.textContent = `Name: ${attributes.name} Category:${attributes.category}`;
      var span1 = document.createElement('span');
      span1.textContent = 'Name: ' + attributes.name;
      a.appendChild(span1);

      if (attributes.category) {
        var span2 = document.createElement('span');
        span2.textContent = 'Category:' + attributes.category;
        a.appendChild(span2);
      }

      a.addEventListener('click', function (e) {
        return action(e, list[i]);
      });
      para.appendChild(a);
      display.appendChild(para);
    };

    for (var i = 0; i < list.length; i++) {
      _loop(i);
    }
  };

  // Displays a 'sheet' (saved game instance data) in the template page
  // params:
  //  sheet - JSON object containing info on the sheet
  displaySheet = function displaySheet(sheet) {
    var blanks = content.querySelectorAll('.blank');
    var words = sheet.words;
    // console.log('Display list.');

    // Solution to avoid for ... in loops for
    // https://stackoverflow.com/questions/43807515/eslint-doesnt-allow-for-in

    var entries = Object.entries(words);

    if (entries.length !== blanks.length) {
      displayInfo('Invalid data: The number of entries in the savefile do not match the template.', document.querySelector('#submenuDisp'));
      return;
    }

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];

      var _entry = _slicedToArray(entry, 2);

      blanks[i].value = _entry[1];
    }
  };

  // Displays a page with the blank game 'template'.
  // Params:
  //  template - JSON template for a blank game
  //  Lists the text and blanks for the game
  displayTemplatePage = function displayTemplatePage(template) {
    // Clears the content section
    clearDisplayArea(content);
    openPageMenu();

    // Takes out content
    var elements = template.elements;


    var pageElement = {};
    var subelements = {};

    // Content section
    // Adds a link to take you back to the list
    var backLink = document.createElement('a');
    backLink.textContent = '<- Back';
    backLink.addEventListener('click', function (e) {
      displayTemplateList(templateList, false);

      e.preventDefault();
      return false;
    });
    backLink.href = '';
    content.appendChild(backLink);

    // Appends html elements to content from template.
    for (var i = 0; i < elements.length; i++) {
      pageElement = elements[i].name === 'title' ? document.createElement('h3') : document.createElement('p');
      subelements = elements[i].elements;
      for (var j = 0; j < subelements.length; j++) {
        if (subelements[j].type === 'text') {
          // Adds text section
          var span = document.createElement('span');
          span.textContent = subelements[j].text;
          pageElement.appendChild(span);
        } else {
          // Adds a word blank
          var input = document.createElement('input');
          input.type = 'text';
          if (subelements[j].attributes.type) {
            input.placeholder = subelements[j].attributes.type;
          }
          if (subelements[j].attributes.uppercase) {
            input.classList.add('uppercased');
          }
          input.classList.add('blank');
          pageElement.appendChild(input);
        }
      }
      content.appendChild(pageElement);
    }

    // Side menu
    var submenuDisp = document.querySelector('#submenuDisp');
    var saveForm = document.querySelector('#saveForm');
    var loadButton = document.querySelector('#loadButton');

    clearDisplayArea(submenuDisp);

    // Save function
    var saveFun = function saveFun(e) {
      var jsonObj = {
        name: saveForm.querySelector('#saveName').value,
        template: template.attributes.name,
        words: {}
      };
      var wordlist = content.querySelectorAll('.blank');
      for (var _i = 0; _i < wordlist.length; _i++) {
        var key = 'word' + _i;
        jsonObj.words[key] = wordlist[_i].value;
      }
      var options = {
        body: JSON.stringify(jsonObj)
      };
      sendRequest(e, saveForm, options, submenuDisp, function () {});
    };
    saveForm.addEventListener('submit', saveFun);
    subMenuListeners.push({
      element: '#saveForm',
      event: 'submit',
      function: saveFun
    });

    // Load function
    var loadFun = function loadFun(e) {
      var options = {
        params: '?template=' + template.attributes.name
      };
      sendRequest(e, { method: 'get', action: '/sheetList' }, options, submenuDisp, function (response) {
        return displayList(response, submenuDisp, true, function (e2, listItem) {
          displaySheet(listItem);
          e2.preventDefault();
          return false;
        });
      });
    };
    loadButton.addEventListener('click', loadFun);
    subMenuListeners.push({
      element: '#loadButton',
      event: 'click',
      function: loadFun
    });
  };

  // Display list of 'templates' - blank games
  // Params:
  //  list - the list to display
  //  save - save flag,
  //  if true saves the list to the templateList global
  displayTemplateList = function displayTemplateList(list, save) {
    // Close page menu if it is open
    closePageMenu();

    if (list.length === 0) {
      displayInfo('There are no templates for the category requested.', content);
    } else {
      // Save function
      if (save) {
        templateList = list;
      }
      // Uses generic function to display the list
      displayList(list, content, false, function (e, listItem) {
        displayTemplatePage(listItem);
        e.preventDefault();
        return false;
      });
    }
  };

  // Displays the New Template page
  // Used to add a new template to the server.
  displayNewTemplatePage = function displayNewTemplatePage() {
    // Closes the template page menu, if relevant
    closePageMenu();
    // Clears the content area
    clearDisplayArea(content);

    // Creates the top control div
    var topDiv = document.createElement('div');

    // Creates information <span> element
    var span1 = document.createElement('span');
    span1.textContent = 'Add template information below:';
    topDiv.appendChild(span1);

    // Creates content-type label and drop-down
    var span2 = document.createElement('span');
    span2.classList.add('right');
    var label1 = document.createElement('label');
    label1.textContent = 'Input type:';
    span2.appendChild(label1);

    // Selector element
    var typeSelect = document.createElement('select');
    // JSON selector
    var jsonOption = document.createElement('option');
    jsonOption.value = 'application/json';
    jsonOption.textContent = 'JSON';
    typeSelect.appendChild(jsonOption);
    // XML selector
    var xmlOption = document.createElement('option');
    xmlOption.value = 'text/xml';
    xmlOption.textContent = 'XML';
    typeSelect.appendChild(xmlOption);
    span2.appendChild(typeSelect);
    topDiv.appendChild(span2);
    content.appendChild(topDiv);

    // Text lines for example downloads.
    var div2 = document.createElement('div');
    var span3 = document.createElement('span');
    span3.textContent = 'Not sure how to write the input?';
    div2.appendChild(span3);

    // Link to download example JSON
    var example1 = document.createElement('a');
    example1.href = '/exampleJSON';
    example1.download = 'example';
    example1.type = 'application/json';
    example1.textContent = 'JSON Example';

    // Link to download example XML
    div2.appendChild(example1);
    var example2 = document.createElement('a');
    example2.href = '/exampleXML';
    example2.download = 'example';
    example2.type = 'text/xml';
    example2.textContent = 'XML Example';
    div2.appendChild(example2);
    content.appendChild(div2);

    // Creates the text input zone
    // body for the post call
    var templateInput = document.createElement('textarea');
    templateInput.classList.add('multiline');
    templateInput.placeholder = 'Type here.';
    content.appendChild(templateInput);

    // Div element for displaying information.
    var msgDiv = document.createElement('div');
    msgDiv.textContent = '';

    // Creates a button for submitting the template
    var submitButton = document.createElement('input');
    submitButton.type = 'button';
    submitButton.value = 'Submit Template';
    submitButton.addEventListener('click', function (e) {
      var options = {};
      options.body = templateInput.value;
      options.headers = [{
        key: 'content-type',
        value: typeSelect.value
      }];
      sendRequest(e, { method: 'post', action: '/template' }, options, msgDiv, function () {});
    });
    content.appendChild(submitButton);

    content.appendChild(msgDiv);
  };

  // Response handlers
  // Handles the initial basic response handling,
  // then passes the response on to another fuction for more specific handling
  // Params:
  //  xhr - XMLHttpRequest object containing the response
  //  display - a http element to display errors
  //  method - The method for handling further handling for a 200 response
  handleResponse = function handleResponse(xhr, display, method) {
    // Clears the display area
    clearDisplayArea(display);

    // Checks if there is a 200 response run the specific function
    if (xhr.status === 200) {
      method(JSON.parse(xhr.response));
    } else {
      // If not a 200 status, display the error message
      var info = xhr.status + ': ' + (xhr.response ? JSON.parse(xhr.response).message : 'No content.');
      displayInfo(info, display);
    }
  };

  // Control Functions
  // Initializes the client code.
  // Setting up the event listeners for the global menu,
  // selects the the main content area
  init = function init() {
    // Selectors for elements used throughout the program
    content = document.querySelector('#content');
    pageMenu = document.querySelector('#pageMenu');

    // Selectors for the global menu controls
    var searchForm = document.querySelector('#searchForm');
    var newTemplate = document.querySelector('#newTemplate');

    // Event listener for the template search bar
    searchForm.addEventListener('submit', function (e) {
      var options = {};
      var searchInput = searchForm.querySelector('#searchInput').value;
      if (searchInput !== '') {
        options.params = '?category=' + searchInput;
      }
      sendRequest(e, searchForm, options, content, function (response) {
        return displayTemplateList(response, true);
      });
    });

    // Sets the event listener for opening the new template page.
    newTemplate.addEventListener('click', displayNewTemplatePage);
  };

  window.onload = init;
})();
