/*Helper functions*/
const populateGameData = (e,template,game) => {
      e.preventDefault();
  
      if(document.querySelector("#fullView")){
        generateTemplateFullView(template,game.words);
      } else {
        generateTemplateListView(template,game.words);
      }
      return false;
};

const disabledLink = (e) => {
  e.preventDefault();
  return false;
};

/*Form events*/
const handleSave = (e) => {
  e.preventDefault();
  
  const errDisp = document.querySelector("#searchResults");
  const blankList = document.querySelectorAll("#templateView input");
  
  const words = Object.values(blankList).map((blank) => blank.value);
  
  const data = {
    name: `${$("#saveName").val()}`,
    template: `${$("#templateName").text()}`,
    _csrf: `${$("#save_csrf").val()}`,
    words: words,
  };
  
  sendAjax('POST', $("#saveForm").attr("action"),JSON.stringify(data),"application/json",errDisp,function(data) {
    handleError("Game saved!",errDisp);
  });
  
  return false;  
};

const handleLoad = (e,template) => {
  e.preventDefault();
  
  const errDisp = document.querySelector("#searchResults");
  
  const data = `template=${$("#templateName").text()}&_csrf=${$("#save_csrf").val()}`;
  
  sendAjax('GET', $("#loadForm").attr("action"),data,null,errDisp,function(data) {
    ReactDOM.render(<GameResults template={template} games={data.games}/>, document.querySelector('#searchResults'));
    document.querySelector('#searchResults').style.height = "auto";
  });
  
  return false;
};

const handleChangePassword = (e) => {
  e.preventDefault();
  
  const errDisp = document.querySelector('#passChangeError');
  
  if($("#oldpass").val() === "" || $("#pass").val() === "" || $("#pass2").val() === ""){
    handleError("All fields are required",errDisp);
    return false;
  }
  
  if($("#pass").val() !== $("#pass2").val()) {
    handleError("New passwords do not match",errDisp);
    return false; 
  }
  
  sendAjax('POST', $("#passChangeForm").attr("action"),$("#passChangeForm").serialize(),null,errDisp,function(data){
    handleError("Your password has been changed.", errDisp);
  });
  
  return false;
}

const handleSearch = (e) => {
  e.preventDefault();
  
  sendAjax('GET', $("#searchForm").attr("action"),$("#searchForm").serialize(),null,document.querySelector('#searchResults'),function(data){
    ReactDOM.render(<TemplateResults templates={data.templates}/>, document.querySelector('#searchResults'));
    document.querySelector('#searchResults').style.height = "auto";
  });
  
  return false;  
};

const handleTemplateSubmission = (e) => {
  e.preventDefault();
  
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
    
    let subcontent = [];
    const subelements = Object.values(element.content);
    
    for(let j = 0; j < subelements.length; j++) {
      let subelement = subelements[j];
      const text = _.unescape(subelement.content);
      
      if(subelement.type === "blank"){
        let value = "";
        if(save && save[nextBlank]){
          value = _.unescape(save[nextBlank]);
        }
        
        const updateTempSave = (e) => {
          const target = e.target;
          const num = parseInt(target.name);
          save[num] = target.value;
          generateTemplateFullView(template,save);
        };
        
        subcontent.push(<input name={`${nextBlank}`} className="blank" type="text" placeholder={text} value={value} onChange={updateTempSave}/>);
        nextBlank++;
      } else {
        subcontent.push(<span>{text}</span>);
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
      <div><a href='' className="button" onClick={action}>Show list view.</a></div>
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
        const text = _.unescape(subelem.content);
        let value = "";
        if(save && save[nextBlank]){
          value = _.unescape(save[nextBlank]);
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
            <input name={`${nextBlank}`} className="blank" type="text" placeholder={text} value={value} onChange={updateTempSave}/>
          </li>
        );
        
        nextBlank++;
      }
    };
  };
  
  return (
    <div id='listView'>
      <div><a className="button" href='' onClick={action}>Show full view.</a></div>
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
        <div id="searchResults" class="errorDisp"></div>     
      </div>
    </div>
  );
};

const GameResults = (props) => {
  const template = props.template;
  const games = props.games;
  
  if(games.length === 0){
    return (
      <div><p>No saved games found.</p></div>
    )
  };
  
  const gameList = games.map((game) => {
    const gameAction = (e) => populateGameData(e,template,game);
    return (
      <div className="saveResult">
        <a href="" className="button" onClick={gameAction}>{game.name}</a>
      </div>
    );
  });
  
  return (
    <div>
      {gameList}
    </div>
  )
}

const TemplateResults = (props) => {
  
  if(props.templates.length === 0){
    return (
      <div><p>No results found.</p></div>
    )
  };
  
  const templateList = props.templates.map((template) => {
    const templateAction = (e) => generateTemplatePage(e,template);
    const publicStr = (template.public)?"public":"private";
    
    return (
      <div className="templateResult">
        <a href="" onClick={templateAction}>
          <p className="nameAndCategory">
            <span>Name: {template.name}</span>
            <span>Category: {template.category}</span>
          </p>
          <p>
            Public: {publicStr}
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
  const loadGames = (e) => handleLoad(e,props.template);
  
  return (
    <div>
      <form id="loadForm"
        onSubmit={loadGames}
        action="/gameList"
        method="GET"
        enctype="application/json">
        <input id="load_csrf" type="hidden" name="_csrf" value={props.csrf} />
        <input type="submit" value="Load Game" />
      </form>
    </div>
  );
};

const AccountPage = (props) => {
  return (
    <div>
      <h3>Change password:</h3>
      <form id="passChangeForm"
        onSubmit={handleChangePassword}
        action="/changePass"
        method="POST"
        >
        <label htmlfor="oldpass">Current password:</label>
        <input id="oldpass" type="text" name="oldpass" placeholder="password"/>
        <label htmlFor="pass">New Password: </label>
        <input id="pass" type="text" name="pass" placeholder="password"/>
        <label htmlFor="pass2">Retype New Password: </label>
        <input id="pass2" type="text" name="pass2" placeholder="retype password"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Change Password" />
      </form>
      <div id="passChangeError"></div>
    </div>
  );
};

const DonationPage = (props) => {
  return (
    <div>
      <p className="info">Note: This is not a real donation page. This project does not currently accept donations. This page displays a concept for a donation page that may be used if the site needs to start taking in donations to sustain further use.</p>
      <p>This Fill-In-The-Blanks game does not make any money from advertisements or payed subscriptions. All the funding for this project comes from donations. If you enjoy this service, please donate now so this site can keep running.</p>
      <div>
        <a href="" id="donateNowLink" onClick={disabledLink}
          >Donate Now!</a>
        <span> (Note: there is no donation site, this link doesn't go anywhare.)</span>
      </div>
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
        <p classname="info">Add the text of the game below. Press enter for new lines, type ">" at the beginning of a line for headers, enclose blanks in brackets.
         ex. [noun] or [verb]</p>
        <textarea id="tempContent" name="content" className="multiline" placeHolder="Type here."></textarea>
        <input id="temp_csrf" type="hidden" name="_csrf" value={props.csrf} />
        <input type="submit" value="Create Template" />
      </form>
      <div id="addError" class="errorDisp"></div>
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
      <div id="searchResults" class="errorDisp"> </div>
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

const generateLoadForm = function(csrf,data){
  ReactDOM.render(<LoadForm csrf={csrf} template={data.template}/>,document.querySelector("#loadGame"));
}

const generateTemplatePage = (e,template) => {
  e.preventDefault();
    
  ReactDOM.render(<TemplatePage template={template}/>,document.querySelector('#content'));
  
  getToken(generateSaveForm,{});
  getToken(generateLoadForm,{template: template});
  generateTemplateListView(template,[]);
  
  return false;
};

const generateAccountPage = function(csrf){
  ReactDOM.render(<AccountPage csrf={csrf} />,document.querySelector('#content'));
};

const generateDonationPage = function(){
  ReactDOM.render(<DonationPage/>,document.querySelector('#content'));
}

const generateNewTemplatePage = function(csrf){
  ReactDOM.render(<NewTemplateForm csrf={csrf} />,document.querySelector('#content'));
};

const generateTemplateSearchPage = function(csrf){
  ReactDOM.render(<TemplateSearchForm csrf={csrf}/>,document.querySelector('#content'))
};

/*Startup*/
const setup = function(csrf) {
  const searchButton = document.querySelector("#templateSearchButton");
  const newTemplateButton = document.querySelector("#newTemplateButton");
  const donateButton = document.querySelector("#donateButton")
  const accountButton = document.querySelector("#accountButton");
  
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
  
  donateButton.addEventListener("click", (e) => {
    e.preventDefault();
    generateDonationPage();
    return false;
  });
  
  accountButton.addEventListener("click", (e) => {
    e.preventDefault();
    getToken(generateAccountPage,{});
    return false;
  });
  
  generateTemplateSearchPage(csrf);
};

$(document).ready(function() {
  getToken(setup,{});
});