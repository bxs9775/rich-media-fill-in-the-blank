

/*Startup*/
const setup = function(csrf) {
  const searchButton = document.querySelector("#templateSearchButton");
  const newTemplateButton = document.querySelector("#newTemplateButton");
  const donateButton = document.querySelector("#donateButton")
  const accountButton = document.querySelector("#accountButton");
  
  searchButton.addEventListener("click", (e) => {
    e.preventDefault();
     getToken(generateTemplateSearchPage,{});
    return false;
  });
  
  newTemplateButton.addEventListener("click", (e) => {
    e.preventDefault();
    getToken(generateNewTemplatePage,{});
    return false;
  });
  
  donateButton.addEventListener("click", (e) => {
    e.preventDefault();
    generateDonationPage();
    return false;
  });
  
  accountButton.addEventListener("click", (e) => {
    e.preventDefault();
    getToken(generateAccountPage,{});
    return false;
  });
  
  generateTemplateSearchPage(csrf);
};

$(document).ready(function() {
  getToken(setup,{});
});