/* Form Events */
const handleSearch = (e) => {
  e.preventDefault();
  
  sendAjax('GET', $("#searchForm").attr("action"),$("#searchForm").serialize(),null,document.querySelector('#searchResults'),function(data){
    console.dir(data);
    ReactDOM.render(<TemplateResults templates={data.templates}/>, document.querySelector('#searchResults'));
    document.querySelector('#searchResults').style.height = "auto";
  });
  
  return false;  
};

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
    
    return (
      <div className="templateResult">
        <a href="" onClick={templateAction}>
          <p className="nameAndCategory">
            <span>Name: {template.name}</span>
            <span>Category: {template.category}</span>
          </p>
          <p>
            <span>User: {template.user}</span>
            <span>Access: {publicStr}</span>
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
        <input id="searchCategory" type="text" name="category" />
        <label htmlfor="user">User:</label>
        <input id="searchUser" type="text" name="user" />
        <label htmlFor="filter">Access: </label>
        <select name="access">
          <option value="all" selected>all</option>
          <option value="private">private</option>
          <option value="public">public</option>
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
  ReactDOM.render(<TemplateSearchForm csrf={csrf}/>,document.querySelector('#content'))
};