const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.post('/changePass', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePass);
  app.get('/app', mid.requiresLogin, controllers.Account.appPage);
  app.post('/template', mid.requiresLogin, controllers.Template.addTemplate);
  app.get('/templateList', mid.requiresLogin, controllers.Template.getTemplateList);
  app.post('/game', mid.requiresLogin, controllers.Game.addGame);
  app.get('/gameList', mid.requiresLogin, controllers.Game.getGameList);
  // Handles page not found
  app.get('/*', controllers.Account.notFoundRedirect);
};

module.exports = router;
