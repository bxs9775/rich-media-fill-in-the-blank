const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/app', mid.requiresLogin, controllers.Account.appPage);
  app.get('/template', mid.requiresLogin, controllers.Template.getTemplate);
  app.head('/template', mid.requiresLogin, controllers.Template.getTemplateHead);
  app.post('/template', mid.requiresLogin, controllers.Template.addTemplate);
  app.get('/templateList', mid.requiresLogin, controllers.Template.getTemplateList);
  app.head('/templateList', mid.requiresLogin, controllers.Template.getTemplateListHead);
  app.get('/game', mid.requiresLogin, controllers.Game.getGame);
  app.head('/game', mid.requiresLogin, controllers.Game.getGameHead);
  app.post('/game', mid.requiresLogin, controllers.Game.addGame);
  app.get('/gameList', mid.requiresLogin, controllers.Game.getGameList);
  app.head('/gameList', mid.requiresLogin, controllers.Game.getGameListHead);
};

module.exports.router = router;
