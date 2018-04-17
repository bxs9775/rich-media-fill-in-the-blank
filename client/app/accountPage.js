/*Form events*/
const handleChangePassword = (e) => {
  e.preventDefault();
  
  const errDisp = document.querySelector('#passChangeError');
  
  if($("#oldpass").val() === "" || $("#pass").val() === "" || $("#pass2").val() === ""){
    handleError("All fields are required",errDisp);
    return false;
  }
  
  if($("#pass").val() !== $("#pass2").val()) {
    handleError("New passwords do not match",errDisp);
    return false; 
  }
  
  sendAjax('POST', $("#passChangeForm").attr("action"),$("#passChangeForm").serialize(),null,errDisp,function(data){
    handleError("Your password has been changed.", errDisp);
  });
  
  return false;
};

/*React elements*/
const AccountPage = (props) => {
  return (
    <div>
      <h3>Change password:</h3>
      <form id="passChangeForm"
        onSubmit={handleChangePassword}
        action="/changePass"
        method="POST"
        >
        <label htmlfor="oldpass">Current password:</label>
        <input id="oldpass" type="text" name="oldpass" placeholder="password"/>
        <label htmlFor="pass">New Password: </label>
        <input id="pass" type="text" name="pass" placeholder="password"/>
        <label htmlFor="pass2">Retype New Password: </label>
        <input id="pass2" type="text" name="pass2" placeholder="retype password"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Change Password" />
      </form>
      <div id="passChangeError" className="errorDisp"></div>
    </div>
  );
};

/*React generation*/
const generateAccountPage = function(csrf){
  ReactDOM.render(<AccountPage csrf={csrf} />,document.querySelector('#content'));
};