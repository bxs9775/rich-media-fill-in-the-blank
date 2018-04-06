/*Helper functions*/


/*Form events*/
const handleSearch = (e) => {
  e.preventDefault();
  
  sendAjax('GET', $("#searchForm").attr("action"),$("#searchForm").serialize(),document.querySelector('#searchResults'),function() {
    ReactDOM.render(<TemplateResults templates={data.templates}/>, document.querySelector('#searchResults'));
  });
  
  return false;  
};

/*React elements*/

const TemplateFullView = (props) => {
  const template = props.template;
  
  const action = (e) => {
    e.preventDefault();
    generateTemplateListView(template);
    return false;
  };
  
  const content = template.content.map((element) => {
    const subcontent = element.map((subelement) => {
      if(subelement.type === "blank"){
        return (<input className="blank" type="text" placeholder={subelement.content}/>);
      }
      return (<span>{subelement.content}</span>);
    });
    if(element.type == "title"){
      return (<h3>{subcontent}</h3>);
    }
    return (<p>{subcontent}</p>);
  });
  
  return (
    <div>
      <div><a href='' onClick={action}>Show list view.</a></div>
      <div>
        {content}
      </div>
    </div>
  );
};

const TemplateListView = (props) => {
  const template = props.template;
  
  const action = (e) => {
    e.preventDefault();
    generateTemplateFullView(template);
    return false;
  };
  
  const blankList = [];
  const content = Object.entries(template.content);
  const contentLength = content.length;
  for(let i = 0; i < contentLength; i++){
    const subcontent = Object.entries(content.content);
    const subcontentLength = subcontent.length;
    
    for(let j = 0; j < subcontentLength; j++){
      if(subcontent[j].type === "blank"){
        blankList.push(
          <li>
            <input className="blank" type="text" placeholder={subcontent[j].content}/>
          </li>
        );
      }
    };
  };
  
  return (
    <div>
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
      <div id="templateView">
      </div>
      <section id="templateMenu">
        <div className="menuForm" id="saveTemplate"></div>
        <div className="menuForm" id="loadTemplate"></div>
        <div id="searchResults"></div>     
    </section>
    </div>
  );
};

const TemplateResults = (props) => {
  if(props.templates.length === 0){
    return (
      <div><p>No results found.</p></div>
    )
  };
  
  const TemplateList = rops.templates.map((template) => {
    const templateAction = (e) => { generateTemplatePage(template);}
    
    return (
      <div>
        <a className="templateResult" href="" onclick={templateAction}>
          <p className="nameAndCategory">
            <span>Name: {template.name}</span>
            <span>Category: {template.name}</span>
          </p>
          <p>
            Public: {template.public}
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

const NewTemplateForm = (props) => {
  
};

const TemplateSearchForm = (props) => {
  return (
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
  );
};

/*React generation*/
const generateTemplateFullView = function(template){
  ReactDOM.render(<TemplateFullView template={template}/>,document.querySelector('#templateView'));
};

const generateTemplateListView = function(template){
  ReactDOM.render(<TemplateListView template={template}/>,document.querySelector('#templateView'));
};

const generateTemplatePage = function(template){
  ReactDOM.render(<TemplatePage template={template}/>,document.querySelector('#content'));
  generateTemplateListView(template);
};

const generateTemplateSearchPage = function(csrf){
  const searchPage = (
    <div>
      <TemplateSearchForm csrf={csrf}/>
      <div id="searchResults"></div>
    </div>
  );
  ReactDOM.render(searchPage,document.querySelector('#content'))
};

/*Startup*/
const setup = function(csrf) {
  generateTemplateSearchPage(csrf);
};

$(document).ready(function() {
  getToken(setup,{});
});