const models = require('../models');

const Game = models.Game;

/* Controller methods*/
const getGame = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body._id) {
    const message = 'The request requires the id of the desired game.';
    return res.status(400).json({ error: message });
  }

  return Game.GameModel.findById(req.body._id, (err, docs) => {
    if (err) {
      console.log(err);

      return res.status(400).json({ error: 'An error occured.' });
    }

    if (docs.owner.toString() !== req.session.account._id) {
      return res.status(403).json({ error: 'The user does not have access to this save.' });
    }
    return res.json({ game: docs });
  });
};

const getGameHead = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body._id) {
    return res.status(400).end();
  }

  return Game.GameModel.findById(req.body._id, (err, docs) => {
    if (err) {
      console.log(err);

      return res.status(400).end();
    }

    if (docs.owner.toString() !== req.session.account._id) {
      return res.status(403).end();
    }
    return res.end();
  });
};

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

const getGameList = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body.template) {
    const message = 'User must specify a template that they want to find game save for.';
    res.status(400).json({ error: message });
  }

  Game.GameModel.findGames(req.session.account._id, req.body.template, (err, docs) => {
    if (err) {
      console.log(err);

      return res.status(400).json({ error: 'An error occured.' });
    }

    const count = docs.length;

    res.set('count', count);
    return res.json({ games: docs });
  });
};

const getGameListHead = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body.template) {
    res.status(400).end();
  }

  Game.GameModel.findGames(req.session.account._id, req.body.template, (err, docs) => {
    if (err) {
      console.log(err);

      return res.status(400).end();
    }

    const count = docs.length;

    res.set('count', count);
    return res.end();
  });
};

/* Exports module */
module.exports.getGame = getGame;
module.exports.getGameHead = getGameHead;
module.exports.addGame = addGame;
module.exports.getGameList = getGameList;
module.exports.getGameListHead = getGameListHead;
