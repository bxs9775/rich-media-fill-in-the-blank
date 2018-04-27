const models = require('../models');

const Game = models.Game;

/* Controller methods*/
// adds game data to the database
const addGame = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body.name) {
    const message = 'The savefile requires a name.';
    return res.status(400).json({ error: message });
  }
  if (!req.body.template) {
    const message = 'The savefile requires an associated template.';
    return res.status(400).json({ error: message });
  }
  if (!req.body.words) {
    const message = 'The savefile requires a list of words.';
    return res.status(400).json({ error: message });
  }

  const gameData = {
    name: req.body.name,
    template: req.body.template,
    words: req.body.words,
    owner: req.session.account._id,
  };

  const newGame = new Game.GameModel(gameData);

  const gamePromise = newGame.save();

  gamePromise.then(() => res.json({ message: 'Game saved correctly.' }));

  gamePromise.catch((err) => {
    console.log(err);

    return res.status(400).json({ error: 'An error occurred' });
  });

  return gamePromise;
};

// gets a list of Games associated with a template and user
const getGameList = (request, response) => {
  const req = request;
  const res = response;

  if (!req.query.template) {
    const message = 'User must specify a template that they want to find game save for.';
    return res.status(400).json({ error: message });
  }

  return Game.GameModel.findGames(req.session.account._id, req.query.template, (err, docs) => {
    if (err) {
      console.log(err);

      return res.status(400).json({ error: 'An error occured.' });
    }

    const count = docs.length;

    res.set('count', count);

    return res.json({ games: docs });
  });
};

/* Exports module */
module.exports.addGame = addGame;
module.exports.getGameList = getGameList;
