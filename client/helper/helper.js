//From DomoMaker
// Get a Cross Site Request Forgery(csrf) token
const getToken = (callback,data) => {
  sendAjax('GET','/getToken', null, null, null, (result) => {
    callback(result.csrfToken,data);
  })
};

//Handles error by displaying it on the page.
const handleError = (message,display) => {
  if(display){
    $(display).css("height","18pt");
    $(display).text(message);
  }else{
    console.log(message);
  }
};

//Redirects the client to the given page.
const redirect = (response) => {
  window.location = response.redirect;
};

//Handles AJAX calls to the server
const sendAjax = (type, action, data, contType, errorDisplay, success) => {
  handleError('',errorDisplay);
  
  const contentType = contType || "application/x-www-form-urlencoded; charset=UTF-8";
  
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    contentType: contentType,
    success: success,
    error: function(xhr, status, error) {
      try{
        var messageObj = JSON.parse(xhr.responseText);
        handleError(messageObj.error,errorDisplay);
      }catch(e){
        handleError("An error has occured.",errorDisplay);
      }
    }
  })
};