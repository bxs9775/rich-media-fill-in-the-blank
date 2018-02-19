'use strict';

var templateList = {};
var content = void 0;

var sendRequest = function sendRequest(e, form, options, display, onResponse) {
  var action = form.action;
  var method = form.method;
  if (options.params) {
    action = '' + action + options.params;
  }

  console.dir(action);

  var xhr = new XMLHttpRequest();

  xhr.open(method, action);

  if (options.accept) {
    xhr.setRequestHeader('Accept', options.accept);
  } else {
    xhr.setRequestHeader('Accept', 'application/json');
  }
  console.dir(options.headers);
  if (options.headers) {
    console.log("Headers!");
    for (var i = 0; i < options.headers.length; i++) {
      var header = options.headers[i];
      console.log(header);
      xhr.setRequestHeader(header.key, header.value);
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
        if (subelements[j].attributes.type) {

          input.placeholder = subelements[j].attributes.type;
        }
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
      var para = document.createElement('p');
      var a = document.createElement('a');
      a.href = "";

      //a.textContent = `Name: ${attributes.name} Category:${attributes.category}`;
      var span1 = document.createElement('span');
      span1.textContent = 'Name: ' + attributes.name;
      a.appendChild(span1);

      var span2 = document.createElement('span');
      span2.textContent = 'Category:' + attributes.category;
      //span2.classList.add('right');
      a.appendChild(span2);

      a.addEventListener('click', function (e) {
        displayTemplatePage(list[i]);
        e.preventDefault();
        return false;
      });
      para.appendChild(a);
      content.appendChild(para);
    };

    for (var i = 0; i < list.length; i++) {
      _loop(i);
    }
  }
};

var displayNewTemplatePage = function displayNewTemplatePage() {
  console.log('New template page!');
  clearDisplayArea(content);

  var topDiv = document.createElement('div');

  var span1 = document.createElement('span');
  span1.textContent = 'Add template information below:';
  topDiv.appendChild(span1);

  var span2 = document.createElement('span');
  span2.classList.add('right');
  var label1 = document.createElement('label');
  label1.textContent = 'Input type:';
  span2.appendChild(label1);

  var typeSelect = document.createElement('select');
  var jsonOption = document.createElement('option');
  jsonOption.value = 'application/json';
  jsonOption.textContent = 'JSON';
  typeSelect.appendChild(jsonOption);
  var xmlOption = document.createElement('option');
  xmlOption.value = 'text/xml';
  xmlOption.textContent = 'XML';
  typeSelect.appendChild(xmlOption);
  span2.appendChild(typeSelect);
  topDiv.appendChild(span2);
  content.appendChild(topDiv);

  var div2 = document.createElement('div');
  var span3 = document.createElement('span');
  span3.textContent = "Not sure how to write the input?";
  div2.appendChild(span3);
  var example1 = document.createElement('a');
  example1.href = '/exampleJSON';
  example1.download = 'example';
  example1.type = 'application/json';
  example1.textContent = 'JSON Example';

  div2.appendChild(example1);
  var example2 = document.createElement('a');
  example2.href = '/exampleXML';
  example2.download = 'example';
  example2.type = 'text/xml';
  example2.textContent = 'XML Example';
  div2.appendChild(example2);
  content.appendChild(div2);

  var templateInput = document.createElement('textarea');
  templateInput.classList.add('multiline');
  templateInput.placeholder = 'Type here.';
  content.appendChild(templateInput);

  var msgDiv = document.createElement('div');
  msgDiv.textContent = '';

  var submitButton = document.createElement('input');
  submitButton.type = 'button';
  submitButton.value = 'Submit Template';
  submitButton.addEventListener('click', function (e) {
    var options = {};
    options.body = templateInput.value;
    options.headers = [{
      'key': 'content-type',
      'value': typeSelect.value
    }];
    sendRequest(e, { 'method': 'post', 'action': '/template' }, options, msgDiv, function (response) {});
  });
  content.appendChild(submitButton);

  content.appendChild(msgDiv);
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
