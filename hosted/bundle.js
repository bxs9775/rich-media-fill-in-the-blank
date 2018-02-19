'use strict';

var templateList = {};
var content = void 0;

//Display Functions
var clearDisplayArea = function clearDisplayArea(display) {
  while (display.firstChild) {
    display.removeChild(display.firstChild);
  }
};

var displayInfo = function displayInfo(info, display) {
  var p = document.createElement('p');
  p.classList.add("info");
  p.textContent = info;
  display.appendChild(p);
};

var displayTemplatePage = function displayTemplatePage(template) {
  clearDisplayArea(content);

  var elements = template.elements;

  //console.log(elements);
  //console.log(elements[0]);

  var pageElement = {};
  var subelements = {};
  for (var i = 0; i < elements.length; i++) {
    pageElement = elements[i].name === 'title' ? document.createElement('h2') : document.createElement('p');
    subelements = elements[i].elements;
    for (var j = 0; j < subelements.length; j++) {
      console.log(subelements);
      console.log(subelements[j]);
      if (subelements[j].type === 'text') {
        var span = document.createElement('span');
        span.textContent = subelements[j].text;
        pageElement.appendChild(span);
      } else {
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = subelements[j].attributes.type;
        pageElement.appendChild(input);
      }
    }
    content.appendChild(pageElement);
  }
};

var displayTemplateList = function displayTemplateList(list, save) {
  console.log("Displaying list.");
  console.dir(list);
  clearDisplayArea(content);
  if (list.length == 0) {
    displayInfo('There are no templates for the category requested.', content);
  } else {
    if (save) {
      templateList = list;
    }

    var _loop = function _loop(i) {
      var attributes = list[i].attributes;
      var a = document.createElement('a');
      a.href = "";
      a.textContent = 'Name: ' + attributes.name + ' Category:' + attributes.category;
      a.addEventListener('click', function (e) {
        displayTemplatePage(list[i]);
        e.preventDefault();
        return false;
      });
      content.appendChild(a);
    };

    for (var i = 0; i < list.length; i++) {
      _loop(i);
    }
  }
};

var displayNewTemplatePage = function displayNewTemplatePage() {
  clearDisplayArea(content);
};

//Response handlers
var handleResponse = function handleResponse(xhr, display, method) {
  console.log("Handling response.");
  clearDisplayArea(display);
  if (xhr.status == 200) {
    method(JSON.parse(xhr.response));
  } else {
    var info = xhr.status + ': ' + JSON.parse(xhr.response).message;
    displayInfo(info, display);
  }
};

//Control Functions
var sendRequest = function sendRequest(e, form, options, display, onResponse) {
  var action = form.action;
  var method = form.method;
  if (options.params) {
    action = '' + action + options.params;
  }

  console.dir(action);

  var xhr = new XMLHttpRequest();

  xhr.open(method, action);

  xhr.setRequestHeader('Accept', 'application/json');
  if (options.headers) {
    for (var i = 0; i < options.headers.length; i++) {
      var header = options.headers[i];
      xhr.setRequestHeader(header.header, header.value);
    }
  }

  xhr.onload = function () {
    return handleResponse(xhr, display, onResponse);
  };

  if (options.body) {
    xhr.send(options.body);
  } else {
    xhr.send();
  }

  //Prevents page changing
  e.preventDefault();
  return false;
};

var init = function init() {
  content = document.querySelector("#content");

  var searchForm = document.querySelector("#searchForm");
  var saveForm = document.querySelector("#saveForm");
  var newTemplate = document.querySelector("#newTemplate");

  searchForm.addEventListener('submit', function (e, form) {
    var options = {};
    var searchInput = searchForm.querySelector("#searchInput").value;
    if (searchInput !== "") {
      options.params = '?category=' + searchInput;
    }
    sendRequest(e, searchForm, options, content, function (response) {
      return displayTemplateList(response, true);
    });
  });
  newTemplate.addEventListener('click', displayNewTemplatePage);
};

window.onload = init;
