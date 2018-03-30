(() => {
  let templateList = {};
  let content;
  let pageMenu;
  const subMenuListeners = [];

  // Declaring functions before they are initialized to avoid undeclared errors.
  // Control
  let sendRequest = () => {};
  let handleResponse = () => {};
  let init = () => {};
  // Display
  let openPageMenu = () => {};
  let closePageMenu = () => {};
  let clearDisplayArea = () => {};
  let displayInfo = () => {};
  let displayList = () => {};
  let displaySheet = () => {};
  let displayTemplatePage = () => {};
  let displayTemplateList = () => {};
  let displayNewTemplatePage = () => {};
  let removeSubMenuListeners = () => {};


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
  sendRequest = (e, form, options, display, onResponse) => {
    let { action } = form;
    const { method } = form;

    // Adds any query parameters
    if (options.params) {
      action = `${action}${options.params}`;
    }

    const xhr = new XMLHttpRequest();

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
      for (let i = 0; i < options.headers.length; i++) {
        const header = options.headers[i];

        xhr.setRequestHeader(header.key, header.value);
      }
    }

    // Event listener for when xhr loads
    xhr.onload = () => handleResponse(xhr, display, onResponse);

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
  removeSubMenuListeners = () => {
    let len = subMenuListeners.length;
    while (len > 0) {
      const listener = subMenuListeners[len - 1];
      const element = document.querySelector(listener.element);
      element.removeEventListener(listener.event, listener.function);
      subMenuListeners.pop();
      len--;
    }
  };

  // Opens the submenu when on an individual template page
  openPageMenu = () => {
    removeSubMenuListeners();
    content.style.width = '80%';
    pageMenu.style.display = 'block';
  };

  // Closes the submenu when on not an individual template page
  closePageMenu = () => {
    removeSubMenuListeners();
    content.style.width = '99%';
    pageMenu.style.display = 'none';
  };

  // Clears specified display area, removing all child nodes
  // Params:
  //  display - the html element to be cleared
  clearDisplayArea = (display) => {
    while (display.firstChild) {
      display.removeChild(display.firstChild);
    }
  };

  // Displays text information in the specified display.
  // Param:
  //  info - a text string you want displayed
  //  display - the html element to display info in
  displayInfo = (info, display) => {
    const p = document.createElement('p');
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
  displayList = (list, display, compact, action) => {
    clearDisplayArea(display);

    console.dir(list);
    for (let i = 0; i < list.length; i++) {
      const attributes = (compact) ? list[i] : list[i].attributes;
      const para = document.createElement('p');
      const a = document.createElement('a');
      a.href = '';
      a.classList.add('listItem');

      // a.textContent = `Name: ${attributes.name} Category:${attributes.category}`;
      const span1 = document.createElement('span');
      span1.textContent = `Name: ${attributes.name}`;
      a.appendChild(span1);

      if (attributes.category) {
        const span2 = document.createElement('span');
        span2.textContent = `Category:${attributes.category}`;
        a.appendChild(span2);
      }

      a.addEventListener('click', e => action(e, list[i]));
      para.appendChild(a);
      display.appendChild(para);
    }
  };

  // Displays a 'sheet' (saved game instance data) in the template page
  // params:
  //  sheet - JSON object containing info on the sheet
  displaySheet = (sheet) => {
    const blanks = content.querySelectorAll('.blank');
    const { words } = sheet;
    // console.log('Display list.');

    // Solution to avoid for ... in loops for
    // https://stackoverflow.com/questions/43807515/eslint-doesnt-allow-for-in
    const entries = Object.entries(words);

    if (entries.length !== blanks.length) {
      displayInfo('Invalid data: The number of entries in the savefile do not match the template.', document.querySelector('#submenuDisp'));
      return;
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      [, blanks[i].value] = entry;
    }
  };

  // Displays a page with the blank game 'template'.
  // Params:
  //  template - JSON template for a blank game
  //  Lists the text and blanks for the game
  displayTemplatePage = (template) => {
    // Clears the content section
    clearDisplayArea(content);
    openPageMenu();

    // Takes out content
    const { elements } = template;

    let pageElement = {};
    let subelements = {};

    // Content section
    // Adds a link to take you back to the list
    const backLink = document.createElement('a');
    backLink.textContent = '<- Back';
    backLink.addEventListener('click', (e) => {
      displayTemplateList(templateList, false);

      e.preventDefault();
      return false;
    });
    backLink.href = '';
    content.appendChild(backLink);

    // Appends html elements to content from template.
    for (let i = 0; i < elements.length; i++) {
      pageElement = (elements[i].name === 'title') ? document.createElement('h3') : document.createElement('p');
      subelements = elements[i].elements;
      for (let j = 0; j < subelements.length; j++) {
        if (subelements[j].type === 'text') {
          // Adds text section
          const span = document.createElement('span');
          span.textContent = subelements[j].text;
          pageElement.appendChild(span);
        } else {
          // Adds a word blank
          const input = document.createElement('input');
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
    const submenuDisp = document.querySelector('#submenuDisp');
    const saveForm = document.querySelector('#saveForm');
    const loadButton = document.querySelector('#loadButton');

    clearDisplayArea(submenuDisp);

    // Save function
    const saveFun = (e) => {
      const jsonObj = {
        name: saveForm.querySelector('#saveName').value,
        template: template.attributes.name,
        words: {},
      };
      const wordlist = content.querySelectorAll('.blank');
      for (let i = 0; i < wordlist.length; i++) {
        const key = `word${i}`;
        jsonObj.words[key] = wordlist[i].value;
      }
      const options = {
        body: JSON.stringify(jsonObj),
      };
      sendRequest(e, saveForm, options, submenuDisp, () => {});
    };
    saveForm.addEventListener('submit', saveFun);
    subMenuListeners.push({
      element: '#saveForm',
      event: 'submit',
      function: saveFun,
    });

    // Load function
    const loadFun = (e) => {
      const options = {
        params: `?template=${template.attributes.name}`,
      };
      sendRequest(e, { method: 'get', action: '/sheetList' }, options, submenuDisp, response => displayList(response, submenuDisp, true, (e2, listItem) => {
        displaySheet(listItem);
        e2.preventDefault();
        return false;
      }));
    };
    loadButton.addEventListener('click', loadFun);
    subMenuListeners.push({
      element: '#loadButton',
      event: 'click',
      function: loadFun,
    });
  };

  // Display list of 'templates' - blank games
  // Params:
  //  list - the list to display
  //  save - save flag,
  //  if true saves the list to the templateList global
  displayTemplateList = (list, save) => {
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
      displayList(list, content, false, (e, listItem) => {
        displayTemplatePage(listItem);
        e.preventDefault();
        return false;
      });
    }
  };

  // Displays the New Template page
  // Used to add a new template to the server.
  displayNewTemplatePage = () => {
    // Closes the template page menu, if relevant
    closePageMenu();
    // Clears the content area
    clearDisplayArea(content);

    // Creates the top control div
    const topDiv = document.createElement('div');

    // Creates information <span> element
    const span1 = document.createElement('span');
    span1.textContent = 'Add template information below:';
    topDiv.appendChild(span1);

    // Creates content-type label and drop-down
    const span2 = document.createElement('span');
    span2.classList.add('right');
    const label1 = document.createElement('label');
    label1.textContent = 'Input type:';
    span2.appendChild(label1);

    // Selector element
    const typeSelect = document.createElement('select');
    // JSON selector
    const jsonOption = document.createElement('option');
    jsonOption.value = 'application/json';
    jsonOption.textContent = 'JSON';
    typeSelect.appendChild(jsonOption);
    // XML selector
    const xmlOption = document.createElement('option');
    xmlOption.value = 'text/xml';
    xmlOption.textContent = 'XML';
    typeSelect.appendChild(xmlOption);
    span2.appendChild(typeSelect);
    topDiv.appendChild(span2);
    content.appendChild(topDiv);

    // Text lines for example downloads.
    const div2 = document.createElement('div');
    const span3 = document.createElement('span');
    span3.textContent = 'Not sure how to write the input?';
    div2.appendChild(span3);

    // Link to download example JSON
    const example1 = document.createElement('a');
    example1.href = '/exampleJSON';
    example1.download = 'example';
    example1.type = 'application/json';
    example1.textContent = 'JSON Example';

    // Link to download example XML
    div2.appendChild(example1);
    const example2 = document.createElement('a');
    example2.href = '/exampleXML';
    example2.download = 'example';
    example2.type = 'text/xml';
    example2.textContent = 'XML Example';
    div2.appendChild(example2);
    content.appendChild(div2);

    // Creates the text input zone
    // body for the post call
    const templateInput = document.createElement('textarea');
    templateInput.classList.add('multiline');
    templateInput.placeholder = 'Type here.';
    content.appendChild(templateInput);

    // Div element for displaying information.
    const msgDiv = document.createElement('div');
    msgDiv.textContent = '';

    // Creates a button for submitting the template
    const submitButton = document.createElement('input');
    submitButton.type = 'button';
    submitButton.value = 'Submit Template';
    submitButton.addEventListener('click', (e) => {
      const options = {};
      options.body = templateInput.value;
      options.headers = [
        {
          key: 'content-type',
          value: typeSelect.value,
        },
      ];
      sendRequest(e, { method: 'post', action: '/template' }, options, msgDiv, () => {});
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
  handleResponse = (xhr, display, method) => {
    // Clears the display area
    clearDisplayArea(display);

    // Checks if there is a 200 response run the specific function
    if (xhr.status === 200) {
      method(JSON.parse(xhr.response));
    } else {
      // If not a 200 status, display the error message
      const info = `${xhr.status}: ${(xhr.response) ? JSON.parse(xhr.response).message : 'No content.'}`;
      displayInfo(info, display);
    }
  };

  // Control Functions
  // Initializes the client code.
  // Setting up the event listeners for the global menu,
  // selects the the main content area
  init = () => {
    // Selectors for elements used throughout the program
    content = document.querySelector('#content');
    pageMenu = document.querySelector('#pageMenu');

    // Selectors for the global menu controls
    const searchForm = document.querySelector('#searchForm');
    const newTemplate = document.querySelector('#newTemplate');

    // Event listener for the template search bar
    searchForm.addEventListener('submit', (e) => {
      const options = {};
      const searchInput = searchForm.querySelector('#searchInput').value;
      if (searchInput !== '') {
        options.params = `?category=${searchInput}`;
      }
      sendRequest(e, searchForm, options, content, response => displayTemplateList(response, true));
    });

    // Sets the event listener for opening the new template page.
    newTemplate.addEventListener('click', displayNewTemplatePage);
  };

  window.onload = init;
})();
