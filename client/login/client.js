//From DomoMaker
// Handles the login process
const handleLogin = (e) => {
  e.preventDefault();
  
  const errDisp = document.querySelector("#loginError");
  
  if($("#user").val() == '' || $("#pass").val() == ''){
    handleError("Username and password are required",errDisp);
    return false;
  }
  
  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(),null, errDisp, redirect);
  
  return false;
};

// Handles the signup process
const handleSignup = (e) => {
  e.preventDefault();
  
  const errDisp = document.querySelector("#loginError");
  
  if($("user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("All fields are required",errDisp);
    return false;
  }
  
  if($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords do not match",errDisp);
    return false;
  }
  
  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), null, errDisp, redirect);
  
  return false;
};

// Creates the login screen for the client
const LoginWindow = (props) => {
  return (
  <form id="loginForm" name="loginForm"
    onSubmit={handleLogin}
    action="/login"
    method="POST"
    className="mainForm"
    >
      <label htmlFor="username">Username: </label>
      <input id="user" type="text" name="username" placeholder="username"/>
      <label htmlFor="pass">Password: </label>
      <input id="pass" type="password" name="pass" placeholder="password"/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="formSubmit" type="submit" value="Sign In" />
    </form>
  );
};

// Creates the signup screen for the client
const SignupWindow = (props) => {
  return (
  <form id="signupForm" name="signupForm"
    onSubmit={handleSignup}
    action="/signup"
    method="POST"
    className="mainForm"
    >
      <label htmlFor="username">Username: </label>
      <input id="user" type="text" name="username" placeholder="username"/>
      <label htmlFor="pass">Password: </label>
      <input id="pass" type="text" name="pass" placeholder="password"/>
      <label htmlFor="pass2">Password: </label>
      <input id="pass2" type="text" name="pass2" placeholder="retype password"/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="formSubmit" type="submit" value="Sign Up" />
    </form>
  );
};

// Renders the Login Window
const createLoginWindow = (csrf) => {
  ReactDOM.render(
    <LoginWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

// Renders the Signup Window
const createSignupWindow = (csrf) => {
  ReactDOM.render(
    <SignupWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

//Sets up event listeners and takes the user to the login 'page'
const setup = (csrf) => {
  const signupButton = document.querySelector("#signupButton");
  const loginButton = document.querySelector("#loginButton");
  const body = document.querySelector("body");
  
  signupButton.addEventListener("click", (e) => {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });
  
  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });
  
  body.addEventListener("click", (e) => closeAllErrors());
  
  createLoginWindow(csrf); //default view
};

//Runs setup when the document is opened.
$(document).ready(function() {
  getToken(setup,{});
});