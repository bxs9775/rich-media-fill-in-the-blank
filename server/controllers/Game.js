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

};

const getGameList = (request, response) => {

};

const getGameListHead = (request, response) => {

};

/* Exports module */
module.exports.getGame = getGame;
module.exports.getGameHead = getGameHead;
module.exports.addGame = addGame;
module.exports.getGameList = getGameList;
module.exports.getGameListHead = getGameListHead;
