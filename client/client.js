let templateList = {};
let content;
let pageMenu;

//AJAX requests
const sendRequest = (e,form,options,display,onResponse) => {
  let action = form.action;
  let method = form.method;
  if(options.params){
    action = `${action}${options.params}`;
  }
  
  console.dir(action);
  
  const xhr = new XMLHttpRequest();
  
  xhr.open(method,action);
  
  if(options.accept){
    xhr.setRequestHeader('Accept', options.accept);
  }else{
    xhr.setRequestHeader('Accept', 'application/json');
  }
  console.dir(options.headers);
  if(options.headers){
    console.log("Headers!");
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
const openPageMenu = () => {
  content.style.width = '80%';
  pageMenu.style.display = 'block';
};

const closePageMenu = () => {
  content.style.width = '99%';
  pageMenu.style.display = 'none';
};

const clearDisplayArea = (display) => {
  while(display.firstChild){
    display.removeChild(display.firstChild);
  }
};

const displayInfo = (info,display) => {
  const p = document.createElement('p');
  p.classList.add("info");
  p.textContent = info;
  display.appendChild(p);
}

const displayList = (list,display,action) => {
    for(let i = 0; i < list.length; i++){
      let attributes = list[i].attributes;
      let para = document.createElement('p');
      let a = document.createElement('a');
      a.href = "";
      a.classList.add('listItem');
      
      //a.textContent = `Name: ${attributes.name} Category:${attributes.category}`;
      const span1 = document.createElement('span');
      span1.textContent = `Name: ${attributes.name}`;
      a.appendChild(span1);
      
      const span2 = document.createElement('span');
      span2.textContent = `Category:${attributes.category}`;
      //span2.classList.add('right');
      a.appendChild(span2);
      
      a.addEventListener('click',(e) => action(e,list[i]));
      para.appendChild(a);
      display.appendChild(para);
    }
}

const displaySheet = (sheet) => {
  const blanks = content.querySelectorAll('.blank');
  const words = sheet.words;
  
  if(words.length !== blanks.sheet){
    displayInfo('Invalid data: The number of entries in the savefile do not match the template.',document.querySelector('#submenuDisp'));
    return;
  }
  
  for(let i = 0; i < words.length;i++){
    blanks[i] = words[i];
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
  saveForm.addEventListener('submit',(e,form) => {
    let jsonObj = {
      'name': form.querySelector('#saveName'),
      'template': template.attributes.name,
      'words': [],
    }
    let wordlist = content.querySelectorAll('.blank');
    for(let i = 0; i < wordlist.length; i++){
      jsonObj.words.push({i:wordlist[i].value});
    };
    let options = {
      body = JSON.stringify(jsonObj);
    }
    sendRequest(e,form,options,submenuDisp,(response) => {});
  });
  //Load
  loadButton.addEventListener('click',(e) => {
    sendRequest(e,{'method':'get','action':'/sheetList'},{},submenuDisp,(response) => displayList(response.sheets,submenuDisp,(e,listItem) => displaySheet(sheet)));
  })
};

const displayTemplateList = (list,save) => {
  closePageMenu();
  
  console.log("Displaying list.");
  console.dir(list);
  clearDisplayArea(content)
  if(list.length == 0){
    displayInfo(`There are no templates for the category requested.`,content);
  } else {
    if(save){
      templateList = list;
    }
    /*
    for(let i = 0; i < list.length; i++){
      let attributes = list[i].attributes;
      let para = document.createElement('p');
      let a = document.createElement('a');
      a.href = "";
      a.classList.add('listItem');
      
      //a.textContent = `Name: ${attributes.name} Category:${attributes.category}`;
      const span1 = document.createElement('span');
      span1.textContent = `Name: ${attributes.name}`;
      a.appendChild(span1);
      
      const span2 = document.createElement('span');
      span2.textContent = `Category:${attributes.category}`;
      //span2.classList.add('right');
      a.appendChild(span2);
      
      a.addEventListener('click',(e) => {
        displayTemplatePage(list[i]);
        e.preventDefault();
        return false;
      });
      para.appendChild(a);
      content.appendChild(para);
    }
    */
    displayList(list,content,(e,listItem) => {
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
  clearDisplayArea(display);
  if(xhr.status == 200){
    method(JSON.parse(xhr.response));
  } else {
    const info = `${xhr.status}: ${JSON.parse(xhr.response).message}`;
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
  
  searchForm.addEventListener('submit', (e,form) => {
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