//From DomoMaker
// Handles the login process
const handleLogin = (e) => {
  e.preventDefault();
  
  if($("#user").val() == '' || $("#pass").val() == ''){
    handleError("User and password are required",$("#loginError"));
    return false;
  }
  
  console.log($("input[name=_csrf]").val());
  
  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect, $("#loginError"));
  
  return false;
};

// Handles the signup process
const handleSignup = (e) => {
  e.preventDefault();
  
  if($("user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("All fields are required",$("#loginError"));
    return false;
  }
  
  if($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords do not match",$("#loginError"));
    return false;
  }
  
  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect, $("#loginError"));
  
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
      <input id="pass" type="text" name="pass" placeholder="password"/>
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
  console.log("Login setup called.");
  const signupButton = document.querySelector("#signupButton");
  const loginButton = document.querySelector("#loginButton");
  
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
  
  createLoginWindow(csrf); //default view
};

//Runs setup when the document is opened.
$(document).ready(function() {
  getToken(setup,{});
});