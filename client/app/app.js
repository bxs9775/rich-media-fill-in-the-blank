/*Startup*/
//Sets up the app page when first navigating to it
//Automatically displays the template search page.
const setup = function(csrf) {
  const searchButton = document.querySelector("#templateSearchButton");
  const newTemplateButton = document.querySelector("#newTemplateButton");
  const donateButton = document.querySelector("#donateButton")
  const accountButton = document.querySelector("#accountButton");
  const body = document.querySelector("body");
  
  //Sets up navigation to the search page
  searchButton.addEventListener("click", (e) => {
    e.preventDefault();
     getToken(generateTemplateSearchPage,{});
    return false;
  });
  
  //Sets up navigation to the new template page
  newTemplateButton.addEventListener("click", (e) => {
    e.preventDefault();
    getToken(generateNewTemplatePage,{});
    return false;
  });
  
  //sets up navigation to the donate page
  donateButton.addEventListener("click", (e) => {
    e.preventDefault();
    generateDonationPage();
    return false;
  });
  
  //sets up navigation to the account page
  accountButton.addEventListener("click", (e) => {
    e.preventDefault();
    getToken(generateAccountPage,{});
    return false;
  });
  
  //handles the closing of all the error messages
  body.addEventListener("click", (e) => closeAllErrors());
  
  //navigates to the search page
  generateTemplateSearchPage(csrf);
};

$(document).ready(function() {
  getToken(setup,{});
});