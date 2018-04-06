// Reused from the DomoMaker assignment

// Checks if a user is logged in. Redirect to the login page if a user isn't logged in.
const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }
  return next();
};

// Checks if there is a user logged in and redirects to the maker page if an active user is found.
const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/app');
  }
  return next();
};

// Makes sure the user is running on https
const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

// skips the the requiresSecure function
const bypassSecure = (req, res, next) => next();

// export modules
module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;
if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
