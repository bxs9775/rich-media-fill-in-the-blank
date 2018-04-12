// Taken from the DemoMaker assignment account controller
const models = require('../models');

const Account = models.Account;

// Sends the login page to the client
const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

// Sends the app page to the client (not sure where to put this)
const appPage = (req, res) => {
  res.render('app', { csrfToken: req.csrfToken() });
};

// Ends the current session and sends the user to the login page
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// Logs the user in and takes them to the app page
const login = (request, response) => {
  const req = request;
  const res = response;

  // Cast data to strings.
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'Both username and password are required' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/app' });
  });
};

// Processes a new user account
const signup = (request, response) => {
  const req = request;
  const res = response;

  // Cast data to strings.
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  // Checks that the fields are filled out
  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Checks that the passwords match
  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // Sets up new user
  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      res.json({ redirect: '/app' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occured' });
    });
  });
};

const changePass = (request, response) => {
  const req = request;
  const res = response;

  const username = req.session.account.username;
  const oldpass = `${req.body.oldpass}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // Checks if all fields are filled out
  if (!oldpass || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Checks that the passwords match
  if (pass !== pass2) {
    return res.status(400).json({ error: 'New passwords do not match' });
  }

  return Account.AccountModel.authenticate(username, oldpass, (err, account) => {
    if (err || !account) {
      if (err) {
        console.log(err);
      }
      return res.status(401).json({ error: 'Wrong password for account.' });
    }

    const tempAccount = account;
    return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
      tempAccount.salt = salt;
      tempAccount.password = hash;

      const savePromise = tempAccount.save();

      savePromise.then(() => {
        req.session.account = Account.AccountModel.toAPI(tempAccount);
        res.status(204).end();
      });

      savePromise.catch((err2) => {
        console.log(err2);

        return res.status(400).json({ error: 'An error occured' });
      });
    });
  });
};

// Requests and retrieves a new csrf token
const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

// exports
module.exports.loginPage = loginPage;
module.exports.appPage = appPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.changePass = changePass;
module.exports.getToken = getToken;
