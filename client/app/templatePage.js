/*Helper functions*/
// updates the current template view with the new game data
const populateGameData = (e,template,game) => {
  e.preventDefault();
  
  const words = JSON.parse(JSON.stringify(game)).words;
  
  if(document.querySelector("#fullView")){
    generateTemplateFullView(template,words);
  } else {
    generateTemplateListView(template,words);
  }
  return false;
};

// sends an Ajax request to get the usernames
// given specified ids
const getUsernames = (csrf,ids,callback) => {
  let data = `id=${ids}`;
  if(Array.isArray(ids)){
    if(ids.length < 1){
      return callback([]);
    }
    
  }
  data = `${data}&_csrf=${csrf}`
  return sendAjax('GET', "/usernames",data,null,null,function(usernames) {
    callback(usernames);
  });
}

/*Form events*/
// handles Ajax request to save the game data
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
  
  sendAjax('POST', $("#saveForm").attr("action"),data,null,errDisp,function(info) {
    handleError("Game saved!",errDisp);
  });
  
  return false;  
};

// handles Ajax request to load saved games associated with the template
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

// handles the Ajax request to share the template with a user
const shareTemplate = (e,template) => {
  e.preventDefault();
  
  const errDisp = document.querySelector("#searchResults");
  
  sendAjax('POST', $("#shareForm").attr("action"),$("#shareForm").serialize(),null,errDisp,function(data) {
    handleError("Template is shared.",errDisp);
    const user = $("#shareUser").val();
    if(template.shared){
      template.shared.push(user);
    } else {
      template.shared = [user];
    }
    getToken(generateShareForm,{template: template});
  });
  
  return false;
}

/*React elements*/
// JSX for displaying all the information in a template
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

// JSX for displaying a list of the template's blanks
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
            <label htmlfor={`${nextBlank}`}>{text}: </label>
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

// creates a page for a template
const TemplatePage = (props) => {
  return (
    <div>
      <div id="templateInfo" className="hidden">
        <p id="templateName">{props.template.name}</p>
        <p id="templateCategory">{props.template.category}</p>
      </div>
      <div id="templateView">
      </div>
      <div id="templateMenu">
        <div className="menuForm" id="saveGame"></div>
        <div className="menuForm" id="loadGame"></div>
        <div className="menuForm" id="share"></div>
        <div id="searchResults" className="errorDisp"></div>     
      </div>
    </div>
  );
};

// creates JSX for the results of loading saved game data
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
};

// creates the form for saving game data
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
};

// creates the form for loading game data
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

// displays a list of users the template is shared with
const ShareDetails = (props) => {
  const usernames = props.usernames;
  
  
  let userList = {};
  
  if(Array.isArray(usernames)){
    if(usernames.length < 1){
      userList = (<div>(No one...)</div>);
    } else {
      userList = usernames.map((name) => (<div>{name}</div>));
    }
  } else {
    userList = (<div>{usernames}</div>);
  }
  
  return (
    <div>
      <div>Template shared with:</div>
      {userList}
    </div>
  );
}

//creates the form for sharing the template
const ShareForm = (props) => {
  const shareAction = (e) => shareTemplate(e,props.template);
  
  return (
    <div>
      <div id="shareInfo"></div>
      <form id="shareForm"
      onSubmit={shareAction}
      action="/share"
      method="POST">
        <label htmlfor="user">Share template with user:</label>
        <input id="shareUser" type="text" name="user"/>
        <input type="hidden" name="_id" value={props.template._id}/>
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input type="submit" value="Share Template" />
      </form>
    </div>
  );
};

/*React generation*/
// renders the full view of the template
const generateTemplateFullView = function(template,save){
  ReactDOM.render(<TemplateFullView template={template} save={save}/>,document.querySelector('#templateView'));
};

// renders the list view of the template
const generateTemplateListView = function(template,save){
  ReactDOM.render(<TemplateListView template={template} save={save}/>,document.querySelector('#templateView'));
};

// renders a form for saving game data
const generateSaveForm = function(csrf){
  ReactDOM.render(<SaveForm csrf={csrf}/>,document.querySelector("#saveGame"));
};

// renders a form for loading game data
const generateLoadForm = function(csrf,data){
  ReactDOM.render(<LoadForm csrf={csrf} template={data.template}/>,document.querySelector("#loadGame"));
};

// renders the details on who the template is shared with
const generateShareDetails = function(usernames){
  ReactDOM.render(<ShareDetails usernames={usernames}/>,document.querySelector("#shareInfo"));
}

// renders a form for sharing templates
const generateShareForm = function(csrf,data){
  ReactDOM.render(<ShareForm csrf={csrf} template={data.template}/>,document.querySelector("#share")); 
  const usernames = data.template.shared;
  generateShareDetails(usernames);
};

// renders the page for the selected template in the website
const generateTemplatePage = (e,template) => {
  e.preventDefault();
    
  ReactDOM.render(<TemplatePage template={template}/>,document.querySelector('#content'));
  
  getToken(generateSaveForm,{});
  getToken(generateLoadForm,{template: template});
  const currUser = $("#currentUser").text();
  if(currUser === template.user && !(template.public)){
    const getUsers = (csrf,data) => getUsernames(csrf,data.template.shared,function(usernames){
      template.shared = [];
      if(usernames && usernames.usernames){
        template.shared = usernames.usernames.map((user) => user.username);
      }
      getToken(generateShareForm,{template: data.template});
    });
    getToken(getUsers,{template: template});
  }
  generateTemplateListView(template,[]);
  
  return false;
};