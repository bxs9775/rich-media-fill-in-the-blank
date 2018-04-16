/*Form events*/
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
};

/*React elements*/
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

/*React rendering*/
const generateNewTemplatePage = function(csrf){
  ReactDOM.render(<NewTemplateForm csrf={csrf} />,document.querySelector('#content'));
};