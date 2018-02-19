let templateList = {};
let content;

//Display Functions
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

const displayTemplatePage = (template) => {
  clearDisplayArea(content);
  
  let { elements } = template;
    
  //console.log(elements);
  //console.log(elements[0]);
  
  let pageElement = {};
  let subelements = {};
  for(let i = 0; i < elements.length; i++){
    pageElement = (elements[i].name === 'title')?document.createElement('h2'):document.createElement('p');
    subelements = elements[i].elements;
    for(let j = 0; j < subelements.length;j++){
      console.log(subelements);
      console.log(subelements[j]);
      if(subelements[j].type === 'text'){
        let span = document.createElement('span');
        span.textContent = subelements[j].text;
        pageElement.appendChild(span);
      } else {
        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = subelements[j].attributes.type;
        pageElement.appendChild(input);
      }
    }
    content.appendChild(pageElement);
  }
};

const displayTemplateList = (list,save) => {
  console.log("Displaying list.");
  console.dir(list);
  clearDisplayArea(content)
  if(list.length == 0){
    displayInfo(`There are no templates for the category requested.`,content);
  } else {
    if(save){
      templateList = list;
    }
    for(let i = 0; i < list.length; i++){
      let attributes = list[i].attributes;
      let a = document.createElement('a');
      a.href = "";
      a.textContent = `Name: ${attributes.name} Category:${attributes.category}`;
      a.addEventListener('click',(e) => {
        displayTemplatePage(list[i]);
        e.preventDefault();
        return false;
      });
      content.appendChild(a);
    }
  }
};


const displayNewTemplatePage = () => {
  clearDisplayArea(content)
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
const sendRequest = (e,form,options,display,onResponse) => {
  let action = form.action;
  let method = form.method;
  if(options.params){
    action = `${action}${options.params}`;
  }
  
  console.dir(action);
  
  const xhr = new XMLHttpRequest();
  
  xhr.open(method,action);
  
  xhr.setRequestHeader('Accept', 'application/json');
  if(options.headers){
    for(let i = 0; i < options.headers.length; i++){
      let header = options.headers[i];
      xhr.setRequestHeader(header.header,header.value);
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

const init = () => {
  content = document.querySelector("#content");
  
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