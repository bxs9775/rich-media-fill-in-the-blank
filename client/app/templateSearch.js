/* Form Events */
const handleSearch = (e) => {
  e.preventDefault();
  
  sendAjax('GET', $("#searchForm").attr("action"),$("#searchForm").serialize(),null,document.querySelector('#searchResults'),function(data){
    ReactDOM.render(<TemplateResults templates={data.templates}/>, document.querySelector('#searchResults'));
    document.querySelector('#searchResults').style.height = "auto";
  });
  
  return false;  
};

const displayDefaultResults = () => {
  sendAjax('GET', '/templateList',"sort=createdDate&direction=descending&limit=5",null,document.querySelector('#searchResults'),function(data){
    ReactDOM.render(<TemplateResults templates={data.templates}/>, document.querySelector('#searchResults'));
    document.querySelector('#searchResults').style.height = "auto";
  });
}

/* React Elements */
const TemplateResults = (props) => {
  
  if(props.templates.length === 0){
    return (
      <div><p>No results found.</p></div>
    )
  };
  
  const templateList = props.templates.map((template) => {
    const templateAction = (e) => generateTemplatePage(e,template);
    const publicStr = (template.public)?"public":"private";
    
    const name = _.unescape(template.name);
    const category = _.unescape(template.category);
    
    let access = [];
    access.push(<span>Access: {publicStr}</span>);
    const currId = $('#currentId').text();
    if(template.shared.includes(currId)){
      access.push(<span> (Shared with you)</span>);
    }
    
    return (
      <div className="templateResult">
        <a href="" onClick={templateAction}>
          <p className="nameAndCategory">
            <span>Name: {name}</span>
            <span>Category: {category}</span>
          </p>
          <p>
            <span>User: {template.user}</span>
            {access}
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

const TemplateSearchForm = (props) => {
  return (
    <div>
      <form id="searchForm"
        onSubmit = {handleSearch}
        action="/templateList" 
        method="GET">
        <label htmlfor="category">Category:</label>
        <input id="searchCategory" type="text" name="category"/>
        <label htmlfor="user">User:</label>
        <input id="searchUser" type="text" name="user"/>
        <label htmlFor="filter">Access: </label>
        <select name="access">
          <option value="all" selected>all</option>
          <option value="private">private</option>
          <option value="public">public</option>
        </select>
        <label htmlFor="limit">Limit: </label>
        <input id="limit" type="number" min="1" max="50" name="limit"/>
        <label htmlFor="sort">Sort by: </label>
        <select name="sort">
          <option value="createdDate" selected>created date</option>
          <option value="name">name</option>
          <option value="category">category</option>
          <option value="owner">owner</option>
        </select>
        <select name="direction">
          <option value="ascending">ascending</option>
          <option value="descending" selected>descending</option>\
        </select>
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input type="submit" value="Search Templates" />
      </form>
      <div id="searchResults" className="errorDisp"> </div>
    </div>
  );
};

/* React Generation */
const generateTemplateSearchPage = function(csrf){
  ReactDOM.render(<TemplateSearchForm csrf={csrf}/>,document.querySelector('#content'));
  document.querySelector("#limit").value = 5;
  displayDefaultResults();
};