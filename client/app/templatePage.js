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
        <div id="searchResults" className="errorDisp"></div>     
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
};

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