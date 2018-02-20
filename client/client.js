let templateList = {};
let content;
let pageMenu;

//AJAX requests
//Sends an AJAX request
//Params:
//  e - triggering event object
//  form - the form object making the call
//  (this field is given JSON with method and action for <a>)
//  options - object containing optional headers, body, and
//  query parameters
//  display - an object used to display information from the response
//  onResponse - method called after performing the basic handling of the request.
const sendRequest = (e,form,options,display,onResponse) => {
  let action = form.action;
  let method = form.method;
  if(options.params){
    action = `${action}${options.params}`;
  }
  
  const xhr = new XMLHttpRequest();
  
  xhr.open(method,action);
  
  if(options.accept){
    xhr.setRequestHeader('Accept', options.accept);
  }else{
    xhr.setRequestHeader('Accept', 'application/json');
  }
  
  if(options.headers){
    for(let i = 0; i < options.headers.length; i++){
      let header = options.headers[i];
      console.log(header);
      xhr.setRequestHeader(header.key,header.value);
    }
  }
  
  xhr.onload = () => handleResponse(xhr,display,onResponse);
  
  if(options.body){
    xhr.send(options.body);
  }else{
    xhr.send();
  }
  
  //Prevents page changing
  e.preventDefault();
  return false;
};

//Display Functions
//Opens the submenu when on an individual template page
const openPageMenu = () => {
  content.style.width = '80%';
  pageMenu.style.display = 'block';
};

//Closes the submenu when on not an individual template page
const closePageMenu = () => {
  content.style.width = '99%';
  pageMenu.style.display = 'none';
};

//Clears specified display area, removing all child nodes
//Params:
//  display - the html element to be cleared
const clearDisplayArea = (display) => {
  while(display.firstChild){
    display.removeChild(display.firstChild);
  }
};

//Displays text information in the specified display.
//Param:
//  info - a text string you want displayed
//  display - the html element to display info in
const displayInfo = (info,display) => {
  const p = document.createElement('p');
  p.classList.add("info");
  p.textContent = info;
  display.appendChild(p);
}

//Handles displays a list of links based on the given array
//Params:
//  list - an object containing the array of information
//  display - the html element to add the list elements to
//  compact - whether the list is in a compact form or not
//  if this vaule is true it is assumed the 'attributes' are 
//  on the top level of the list, if false the program tries to
//  unwrap things
//  action - the function that will be run when a link is clicked
const displayList = (list,display,compact,action) => {
    console.dir(list);
    for(let i = 0; i < list.length; i++){
      let attributes = (compact)?list[i]:list[i].attributes;
      let para = document.createElement('p');
      let a = document.createElement('a');
      a.href = "";
      a.classList.add('listItem');
      
      //a.textContent = `Name: ${attributes.name} Category:${attributes.category}`;
      const span1 = document.createElement('span');
      span1.textContent = `Name: ${attributes.name}`;
      a.appendChild(span1);
      
      if(attributes.category){
        const span2 = document.createElement('span');
        span2.textContent = `Category:${attributes.category}`;
        a.appendChild(span2);
      }
      
      a.addEventListener('click',(e) => action(e,list[i]));
      para.appendChild(a);
      display.appendChild(para);
    }
}

//Displays a 'sheet' (saved game instance data) in the template page
//params:
//  sheet - JSON object containing info on the sheet
const displaySheet = (sheet) => {
  const blanks = content.querySelectorAll('.blank');
  const words = sheet.words;
  console.log("Display list.");
  
  if(words.length !== blanks.sheet){
    displayInfo('Invalid data: The number of entries in the savefile do not match the template.',document.querySelector('#submenuDisp'));
    return;
  }
  
  const entries = Object.entries(words);
  for(let i = 0; i < entries.length;i++){
    const entry = entries[i];
    blanks[i].value = entry[1];
  }
}

const displayTemplatePage = (template) => {
  clearDisplayArea(content);
  openPageMenu();
  
  let { elements } = template;
    
  //console.log(elements);
  //console.log(elements[0]);
  
  let pageElement = {};
  let subelements = {};
  //Content section
  let backLink = document.createElement('a');
  backLink.textContent = '<- Back';
  backLink.addEventListener('click',(e) => {
    displayTemplateList(templateList,false);
    
    e.preventDefault();
    return false;
  })
  backLink.href='';
  content.appendChild(backLink);
  
  for(let i = 0; i < elements.length; i++){
    pageElement = (elements[i].name === 'title')?document.createElement('h3'):document.createElement('p');
    subelements = elements[i].elements;
    for(let j = 0; j < subelements.length;j++){
      //console.log(subelements);
      //console.log(subelements[j]);
      if(subelements[j].type === 'text'){
        let span = document.createElement('span');
        span.textContent = subelements[j].text;
        pageElement.appendChild(span);
      } else {
        let input = document.createElement('input');
        input.type = 'text';
        if(subelements[j].attributes.type){ 
        input.placeholder = subelements[j].attributes.type;
        }
        if(subelements[j].attributes.uppercase){
          input.classList.add('uppercased');
        }
        input.classList.add('blank');
        pageElement.appendChild(input);
      }
    }
    content.appendChild(pageElement);
  }
  
  //Side menu
  let submenuDisp = document.querySelector('#submenuDisp');
  let saveForm = document.querySelector('#saveForm');
  let loadButton = document.querySelector('#loadButton');
  
  //Save
  saveForm.addEventListener('submit',(e) => {
    //console.dir(saveForm);
    let jsonObj = {
      'name': saveForm.querySelector('#saveName').value,
      'template': template.attributes.name,
      'words': {},
    }
    let wordlist = content.querySelectorAll('.blank');
    for(let i = 0; i < wordlist.length; i++){
      let key = `word${i}`;
      jsonObj.words[key] = wordlist[i].value;
    };
    //console.dir(jsonObj);
   // console.log(jsonObj);
    let options = {
      body: JSON.stringify(jsonObj),
    }
    sendRequest(e,saveForm,options,submenuDisp,(response) => {});
  });
  //Load
  loadButton.addEventListener('click',(e) => {
    sendRequest(e,{'method':'get','action':'/sheetList'},{},submenuDisp,(response) => displayList(response,submenuDisp,true,(e,listItem) => {
      displaySheet(listItem);
      e.preventDefault();
      return false;
    }));
  })
};

const displayTemplateList = (list,save) => {
  closePageMenu();
  
  console.log("Displaying list.");
  //console.dir(list);
  clearDisplayArea(content)
  if(list.length == 0){
    displayInfo(`There are no templates for the category requested.`,content);
  } else {
    if(save){
      templateList = list;
    }
    displayList(list,content,false,(e,listItem) => {
        displayTemplatePage(listItem);
        e.preventDefault();
        return false;
      })
    
  }
};


const displayNewTemplatePage = () => {
  closePageMenu();
  
  console.log('New template page!');
  clearDisplayArea(content);
  
  const topDiv = document.createElement('div');
  
  const span1 = document.createElement('span');
  span1.textContent = 'Add template information below:';
  topDiv.appendChild(span1);
  
  const span2 = document.createElement('span');
  span2.classList.add('right');
  const label1 = document.createElement('label');
  label1.textContent = 'Input type:';
  span2.appendChild(label1);
  
  const typeSelect = document.createElement('select');
  const jsonOption = document.createElement('option');
  jsonOption.value = 'application/json';
  jsonOption.textContent = 'JSON';
  typeSelect.appendChild(jsonOption);
  const xmlOption = document.createElement('option');
  xmlOption.value = 'text/xml';
  xmlOption.textContent = 'XML';
  typeSelect.appendChild(xmlOption);
  span2.appendChild(typeSelect);
  topDiv.appendChild(span2);
  content.appendChild(topDiv);
  
  const div2 = document.createElement('div');
  const span3 = document.createElement('span');
  span3.textContent = "Not sure how to write the input?";
  div2.appendChild(span3);
  const example1 = document.createElement('a');
  example1.href = '/exampleJSON';
  example1.download = 'example';
  example1.type = 'application/json';
  example1.textContent = 'JSON Example';
  
  div2.appendChild(example1);
  const example2 = document.createElement('a');
  example2.href = '/exampleXML';
  example2.download = 'example';
  example2.type = 'text/xml';
  example2.textContent = 'XML Example';
  div2.appendChild(example2);
  content.appendChild(div2);
  
  const templateInput = document.createElement('textarea');
  templateInput.classList.add('multiline');
  templateInput.placeholder = 'Type here.';
  content.appendChild(templateInput);
  
  const msgDiv = document.createElement('div');
  msgDiv.textContent = '';
  
  const submitButton = document.createElement('input');
  submitButton.type = 'button';
  submitButton.value = 'Submit Template';
  submitButton.addEventListener('click', (e) => {
    let options = {};
    options.body = templateInput.value;
    options.headers = [
      {
        'key':'content-type',
        'value':typeSelect.value,
      }
    ];
    sendRequest(e,{ 'method':'post', 'action':'/template'},options,msgDiv,(response) => {});
  });
  content.appendChild(submitButton);
  
  content.appendChild(msgDiv);
};


//Response handlers
const handleResponse = (xhr,display,method) => {
  console.log("Handling response.");
  //console.dir(display);
  clearDisplayArea(display);
  if(xhr.status == 200){
    method(JSON.parse(xhr.response));
  } else {
    const info = `${xhr.status}: ${(xhr.response)?JSON.parse(xhr.response).message:'No content.'}`;
    displayInfo(info,display);
  }
  
};

//Control Functions
const init = () => {
  content = document.querySelector("#content");
  pageMenu = document.querySelector("#pageMenu");
  
  let searchForm = document.querySelector("#searchForm");
  let saveForm = document.querySelector("#saveForm");
  let newTemplate = document.querySelector("#newTemplate")
  
  searchForm.addEventListener('submit', (e) => {
    let options = {};
    let searchInput = searchForm.querySelector("#searchInput").value;
    if(searchInput !== ""){
      options.params = `?category=${searchInput}`;
    }
    sendRequest(e,searchForm,options,content,(response) => displayTemplateList(response,true));
  });
  newTemplate.addEventListener('click',displayNewTemplatePage);
};

window.onload = init;