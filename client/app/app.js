/*Helper functions*/


/*Form events*/
const handleSave = (e) => {
  e.preventDefault();
  
  const errDisp = document.querySelector("#searchResults");
  
  const blankList = document.querySelectorAll("#templateView input");
  console.dir(blankList);
  const words = Object.values(blankList).map((blank) => blank.value);
  
  const data = {
    name: `${$("#saveName").val()}`,
    template: `${$("#templateName").text()}`,
    _csrf: `${$("#save_csrf").val()}`,
    words: words,
  }
  
  console.dir(data);
  
  sendAjax('POST', $("#saveForm").attr("action"),JSON.stringify(data),"application/json",errDisp,function(data) {
    handleError("Game saved!",errDisp);
  });
  
  return false;  
};

const handleLoad = (e) => {
  e.preventDefault();
  
  const errDisp = document.querySelector("#searchResults");
  
  const data = `template=${$("#templateName").text()}&_csrf=${$("#save_csrf").val()}`;
  
  console.dir(data);
  
  sendAjax('GET', $("#loadForm").attr("action"),data,null,errDisp,function(data) {
    console.dir(data);
  });
  
  return false;
};

const handleSearch = (e) => {
  e.preventDefault();
  
  sendAjax('GET', $("#searchForm").attr("action"),$("#searchForm").serialize(),null,document.querySelector('#searchResults'),function(data){
    ReactDOM.render(<TemplateResults templates={data.templates}/>, document.querySelector('#searchResults'));
  });
  
  return false;  
};

const handleTemplateSubmission = (e) => {
  e.preventDefault();
  
  console.dir(`_csrf:${$("#temp_csrf").val()}`);
  
  const errDisp = document.querySelector("#addError");
  if($("#tempName").val() === ""){
    handleError("Name is required.",errDisp);
    return false;
  }
  if($("#tempCategory").val() === ""){
    handleError("Name is required.",errDisp);
    return false;
  }
  if($("#tempContent").val() === ""){
    handleError("Content is required.",errDisp);
    return false;
  }
  
  
  let data = {
    name: `${$("#tempName").val()}`,
    category: `${$("#tempCategory").val()}`,
    public: $("#tempFilter").val(),
    _csrf: `${$("#temp_csrf").val()}`,
  }; 
  /*
  let data = `name=${$("#tempName").val()}`;
  data = `${data}&template:${$("#tempCategory").val()}`;
  data = `${data}&filter:${$("#tempFilter").val()}`;
  data = `${data}&_csrf:${$("#temp_csrf").val()}`;
  */

  let content = {};  
  let contentStr = `${$("#tempContent").val()}`;
  //Split on newline
  //Regex from https://stackoverflow.com/questions/21895233/how-in-node-to-split-string-by-newline-n
  let contentArr = contentStr.split(/\r?\n/);
  
  for(let i = 0; i < contentArr.length;i++){
    let line = contentArr[i];
    let element = {};
    if(line.charAt(0) === '>'){
      element.type = 'title';
      line = line.substring(1);
    } else {
      element.type = 'line';
    }
    let blankStart = line.indexOf('[');
    let blankEnd = line.indexOf(']');
    let nextSpot = 0;
    element.content = {};
    
    while(blankStart >= 0){
      
      if(blankEnd < 0){
        handleError("Found '[' without a closing ']'.",errDisp);
        return false;
      }
      if((blankEnd-blankStart) < 0){
        handleError("Found ']' without a starting '['.",errDisp);
        return false;
      }
      const text = line.substring(0,blankStart);
      if(text.length > 0){
        element.content[`${nextSpot}`] = {
          type: 'text',
          content: text,
        };
        nextSpot++;
      }
      if((blankEnd-blankStart) > 1){
        const value = line.substring(blankStart+1,blankEnd);
        element.content[`${nextSpot}`] = {
          type: 'blank',
          content: value,
        };
        nextSpot++;
      }
      if(blankEnd+1 > line.length){
        line = "";
      }else{
        line = line.substring(blankEnd+1);
      }
      blankStart = line.indexOf('[');
      blankEnd = line.indexOf(']');
    }
    if(line.length > 0){
        element.content[`${nextSpot}`] = {
          type: 'text',
          content: line,
        };
    }
    content[`${i}`] = element;
  }
  
  data.content = content;
  //data = `${data}&content=${JSON.stringify(content)}`;
  
  console.dir(data);
  
  sendAjax('POST', $("#newTemplateForm").attr("action"),JSON.stringify(data),"application/json",errDisp,function(data) {
    handleError("Template added!",errDisp);
  });
  
  return false;
}

/*React elements*/

const TemplateFullView = (props) => {
  const template = props.template;
  const save = props.save;
  
  const action = (e) => {
    e.preventDefault();
    generateTemplateListView(template,save);
    return false;
  };
  
  let nextBlank = 0;
  
  let content = [];
  const elements = Object.values(template.content);
  for(let i = 0; i < elements.length; i++){
    let element = elements[i];
    //console.dir(element);
    
    let subcontent = [];
    const subelements = Object.values(element.content);
    
    for(let j = 0; j < subelements.length; j++) {
      let subelement = subelements[j];
      
      //console.dir(subelement);
      if(subelement.type === "blank"){
        let value = "";
        if(save && save[nextBlank]){
          value = save[nextBlank];
        }
        
        const updateTempSave = (e) => {
          const target = e.target;
          const num = parseInt(target.name);
          save[num] = target.value;
          generateTemplateFullView(template,save);
        };
        
        subcontent.push(<input name={`${nextBlank}`} className="blank" type="text" placeholder={subelement.content} value={value} onChange={updateTempSave}/>);
        nextBlank++;
      } else {
        subcontent.push(<span>{subelement.content}</span>);
      }
    };
    if(element.type == "title"){
      content.push(<h3>{subcontent}</h3>);
    } else {
      content.push(<p>{subcontent}</p>);
    }
  };
  
  return (
    <div id='fullView'>
      <div><a href='' onClick={action}>Show list view.</a></div>
      <div>
        {content}
      </div>
    </div>
  );
};

const TemplateListView = (props) => {
  const template = props.template;
  const save = props.save;
  
  const action = (e) => {
    e.preventDefault();
    generateTemplateFullView(template,save);
    return false;
  };
  
  let nextBlank = 0;
  const blankList = [];
  
  const content = Object.values(template.content);
  
  const contentLength = content.length;
  for(let i = 0; i < contentLength; i++){
    const subcontent = Object.values(content[i].content);
    const subcontentLength = subcontent.length;
    
    for(let j = 0; j < subcontentLength; j++){
      let subelem = subcontent[j];
      
      if(subelem.type === "blank"){
        let value = "";
        if(save && save[nextBlank]){
          value = save[nextBlank];
        }
        
        const updateTempSave = (e) => {
          const target = e.target;
          const num = parseInt(target.name);
          save[num] = target.value;
          generateTemplateListView(template,save);
        };
        
        blankList.push(
          <li>
            <label htmlfor={`${nextBlank}`}>{subelem.content}: </label>
            <input name={`${nextBlank}`} className="blank" type="text" placeholder={subelem.content} value={value} onChange={updateTempSave}/>
          </li>
        );
        
        nextBlank++;
      }
    };
  };
  
  return (
    <div id='listView'>
      <div><a href='' onClick={action}>Show full view.</a></div>
      <div>
        <ol>
          {blankList}
        </ol>
      </div>
    </div>
  );
};

const TemplatePage = (props) => {
  return (
    <div>
      <div id="templateInfo" class="hidden">
        <p id="templateName">{props.template.name}</p>
        <p id="templateCategory">{props.template.category}</p>
      </div>
      <div id="templateView">
      </div>
      <div id="templateMenu">
        <div className="menuForm" id="saveGame"></div>
        <div className="menuForm" id="loadGame"></div>
        <div id="searchResults"></div>     
      </div>
    </div>
  );
};

const TemplateResults = (props) => {
  console.dir(props.templates);
  
  if(props.templates.length === 0){
    return (
      <div><p>No results found.</p></div>
    )
  };
  
  const templateList = props.templates.map((template) => {
    const templateAction = (e) => generateTemplatePage(e,template);
    
    return (
      <div>
        <a className="templateResult" href="" onClick={templateAction}>
          <p className="nameAndCategory">
            <span>Name: {template.name}</span>
            <span>Category: {template.category}</span>
          </p>
          <p>
            Public: {template.public.toString()}
          </p>
        </a>
      </div>
    );
  });
  
  return (
    <div>
      {templateList}
    </div>
  )
};

const SaveForm = (props) => {
  return (
    <div>
      <form id="saveForm"
        onSubmit={handleSave}
        action="/game"
        method="POST"
        enctype="application/json">
        <label htmlfor="name">Name: </label>
        <input id="saveName" type="text"  name="name" placeholder=""/>
        <input id="save_csrf" type="hidden" name="_csrf" value={props.csrf} />
        <input type="submit" value="Save Game" />
      </form>
    </div>
  );
}

const LoadForm = (props) => {
  return (
    <div>
      <form id="loadForm"
        onSubmit={handleLoad}
        action="/gameList"
        method="GET"
        enctype="application/json">
        <input id="load_csrf" type="hidden" name="_csrf" value={props.csrf} />
        <input type="submit" value="Load Game" />
      </form>
    </div>
  );
}

const NewTemplateForm = (props) => {
  return (
    <div>
      <form id="newTemplateForm"
        onSubmit = {handleTemplateSubmission}
        action="/template"
        method="POST"
        enctype="application/json">
        <div>
          <label htmlFor="name">Name: </label>
          <input id="tempName" type="text" name="name" placeholder="name"/>
          <label htmlFor="category">Category: </label>
          <input id="tempCategory" type="text" name="category" placeholder="category"/>
          <label htmlFor="filter">Public:</label>
          <select id="tempFilter" name="filter">
            <option value="false" selected>false</option>
            <option value="true">true</option>
          </select>
        </div>
        <label htmlFor="content">Content:</label>
        <textarea id="tempContent" name="content" className="multiline" placeHolder="Type here."></textarea>
        <input id="temp_csrf" type="hidden" name="_csrf" value={props.csrf} />
        <input type="submit" value="Create Template" />
      </form>
      <div id="addError"></div>
    </div>
  );
};

const TemplateSearchForm = (props) => {
  return (
    <div>
      <form id="searchForm"
        onSubmit = {handleSearch}
        action="/templateList" 
        method="GET">
        <label>Search:</label>
        <input id="searchInput" type="text" name="category" />
        <label htmlFor="filter">Filter: </label>
        <select name="filter">
          <option value="all" selected>all</option>
          <option value="user">user</option>
          <option value="public">public</option>
        </select>
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input type="submit" value="Search Templates" />
      </form>
      <div id="searchResults"> </div>
    </div>
  );
};

/*React generation*/

const generateTemplateFullView = function(template,save){
  ReactDOM.render(<TemplateFullView template={template} save={save}/>,document.querySelector('#templateView'));
};

const generateTemplateListView = function(template,save){
  ReactDOM.render(<TemplateListView template={template} save={save}/>,document.querySelector('#templateView'));
};


const generateSaveForm = function(csrf){
  ReactDOM.render(<SaveForm csrf={csrf}/>,document.querySelector("#saveGame"));
}

const generateLoadForm = function(csrf){
  ReactDOM.render(<LoadForm csrf={csrf}/>,document.querySelector("#loadGame"));
}

const generateTemplatePage = (e,template) => {
  e.preventDefault();
    
  console.log("Template:");
  console.dir(template);
    
  ReactDOM.render(<TemplatePage template={template}/>,document.querySelector('#content'));
  
  getToken(generateSaveForm,document.querySelector("#searchResults"));
  getToken(generateLoadForm,document.querySelector("#searchResults"));
  generateTemplateListView(template,[]);
  
  return false;
};

const generateNewTemplatePage = function(csrf){
  ReactDOM.render(<NewTemplateForm csrf={csrf} />,document.querySelector('#content'));
}

const generateTemplateSearchPage = function(csrf){
  ReactDOM.render(<TemplateSearchForm csrf={csrf}/>,document.querySelector('#content'))
};

/*Startup*/
const setup = function(csrf) {
  console.log("App setup called.");
  const searchButton = document.querySelector("#templateSearchButton");
  const newTemplateButton = document.querySelector("#newTemplateButton");
  
  searchButton.addEventListener("click", (e) => {
    e.preventDefault();
     getToken(generateTemplateSearchPage,{});
    return false;
  });
  
  newTemplateButton.addEventListener("click", (e) => {
    e.preventDefault();
     getToken(generateNewTemplatePage,{});
    return false;
  });
  
  generateTemplateSearchPage(csrf);
};

$(document).ready(function() {
  getToken(setup,{});
});