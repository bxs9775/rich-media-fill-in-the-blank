'use strict';

var templateList = {};
var content = void 0;
var pageMenu = void 0;

//AJAX requests
var sendRequest = function sendRequest(e, form, options, display, onResponse) {
  var action = form.action;
  var method = form.method;
  if (options.params) {
    action = '' + action + options.params;
  }

  //console.dir(action);

  var xhr = new XMLHttpRequest();

  xhr.open(method, action);

  if (options.accept) {
    xhr.setRequestHeader('Accept', options.accept);
  } else {
    xhr.setRequestHeader('Accept', 'application/json');
  }
  //console.dir(options.headers);
  if (options.headers) {
    //console.log("Headers!");
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
var openPageMenu = function openPageMenu() {
  content.style.width = '80%';
  pageMenu.style.display = 'block';
};

var closePageMenu = function closePageMenu() {
  content.style.width = '99%';
  pageMenu.style.display = 'none';
};

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

var displayList = function displayList(list, display, compact, action) {
  console.dir(list);

  var _loop = function _loop(i) {
    var attributes = compact ? list[i] : list[i].attributes;
    var para = document.createElement('p');
    var a = document.createElement('a');
    a.href = "";
    a.classList.add('listItem');

    //a.textContent = `Name: ${attributes.name} Category:${attributes.category}`;
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

var displaySheet = function displaySheet(sheet) {
  var blanks = content.querySelectorAll('.blank');
  var words = sheet.words;
  console.log("Display list.");

  if (words.length !== blanks.sheet) {
    displayInfo('Invalid data: The number of entries in the savefile do not match the template.', document.querySelector('#submenuDisp'));
    return;
  }

  var entries = Object.entries(words);
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    blanks[i].value = entry[1];
  }
};

var displayTemplatePage = function displayTemplatePage(template) {
  clearDisplayArea(content);
  openPageMenu();

  var elements = template.elements;

  //console.log(elements);
  //console.log(elements[0]);

  var pageElement = {};
  var subelements = {};
  //Content section
  var backLink = document.createElement('a');
  backLink.textContent = '<- Back';
  backLink.addEventListener('click', function (e) {
    displayTemplateList(templateList, false);

    e.preventDefault();
    return false;
  });
  backLink.href = '';
  content.appendChild(backLink);

  for (var i = 0; i < elements.length; i++) {
    pageElement = elements[i].name === 'title' ? document.createElement('h3') : document.createElement('p');
    subelements = elements[i].elements;
    for (var j = 0; j < subelements.length; j++) {
      //console.log(subelements);
      //console.log(subelements[j]);
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
        input.classList.add('blank');
        pageElement.appendChild(input);
      }
    }
    content.appendChild(pageElement);
  }

  //Side menu
  var submenuDisp = document.querySelector('#submenuDisp');
  var saveForm = document.querySelector('#saveForm');
  var loadButton = document.querySelector('#loadButton');

  //Save
  saveForm.addEventListener('submit', function (e) {
    //console.dir(saveForm);
    var jsonObj = {
      'name': saveForm.querySelector('#saveName').value,
      'template': template.attributes.name,
      'words': {}
    };
    var wordlist = content.querySelectorAll('.blank');
    for (var _i = 0; _i < wordlist.length; _i++) {
      var key = 'word' + _i;
      jsonObj.words[key] = wordlist[_i].value;
    };
    //console.dir(jsonObj);
    // console.log(jsonObj);
    var options = {
      body: JSON.stringify(jsonObj)
    };
    sendRequest(e, saveForm, options, submenuDisp, function (response) {});
  });
  //Load
  loadButton.addEventListener('click', function (e) {
    sendRequest(e, { 'method': 'get', 'action': '/sheetList' }, {}, submenuDisp, function (response) {
      return displayList(response, submenuDisp, true, function (e, listItem) {
        displaySheet(listItem);
        e.preventDefault();
        return false;
      });
    });
  });
};

var displayTemplateList = function displayTemplateList(list, save) {
  closePageMenu();

  console.log("Displaying list.");
  //console.dir(list);
  clearDisplayArea(content);
  if (list.length == 0) {
    displayInfo('There are no templates for the category requested.', content);
  } else {
    if (save) {
      templateList = list;
    }
    displayList(list, content, false, function (e, listItem) {
      displayTemplatePage(listItem);
      e.preventDefault();
      return false;
    });
  }
};

var displayNewTemplatePage = function displayNewTemplatePage() {
  closePageMenu();

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
  //console.dir(display);
  clearDisplayArea(display);
  if (xhr.status == 200) {
    method(JSON.parse(xhr.response));
  } else {
    var info = xhr.status + ': ' + (xhr.response ? JSON.parse(xhr.response).message : 'No content.');
    displayInfo(info, display);
  }
};

//Control Functions
var init = function init() {
  content = document.querySelector("#content");
  pageMenu = document.querySelector("#pageMenu");

  var searchForm = document.querySelector("#searchForm");
  var saveForm = document.querySelector("#saveForm");
  var newTemplate = document.querySelector("#newTemplate");

  searchForm.addEventListener('submit', function (e) {
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
