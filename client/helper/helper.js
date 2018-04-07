//From DomoMaker
// Get a Cross Site Request Forgery(csrf) token
const getToken = (callback,data) => {
  //console.log("Token called.");
  sendAjax('GET','/getToken', null, null, (result) => {
    callback(result.csrfToken,data);
  })
};

//Handles error by displaying it on the page.
const handleError = (message,display) => {
  if(display){
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
const sendAjax = (type, action, data, errorDisplay, success) => {
  console.dir(errorDisplay);
  handleError('',errorDisplay);
  
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function(xhr, status, error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error,errorDisplay);
    }
  })
};