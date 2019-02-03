const express = require('express');
const router = express.Router();
const Game = require('../models/game');

router.get('/chooseGame', getChooseGame);
router.post('/loadGame', postLoadGame);
router.post('/newGame', postNewGame);

function getChooseGame(req, res, next) {
  res.render('chooseGame', { });
}

function postLoadGame(req, res, next) {

}

function postNewGame(req, res, next) {
  var gameData = {
    name: req.body.name || '',
  };

  if (gameData.name.length) {
    return res.send({ message: 'All fields are required.' });
  }

  Game.create(gameData, function (error, game) {
    if (error) {
      return res.send({ message: 'ERROR: ' + error });
    } else {
      req.session.gameId = game._id;
      return res.send({ game: game });
    }
  });
}

module.exports = router;
