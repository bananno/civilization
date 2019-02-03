const express = require('express');
const router = express.Router();
const Game = require('../models/game');

router.get('/loadGame', loadGameGet);
router.get('/loadGame/:gameId', loadGamePost);
router.get('/newGame', newGameGet);
router.post('/newGame', newGamePost);

function loadGameGet(req, res, next) {
  Game.find({ }, function (error, games) {
    if (error) {
      res.send({ message: 'ERROR: ' + error });
    } else {
      res.render('loadGame', {
        games: games
      });
    }
  });
}

function loadGamePost(req, res, next) {
  req.session.gameId = req.params.gameId;
  res.redirect('/');
}

function newGameGet(req, res, next) {
  res.render('newGame', { });
}

function newGamePost(req, res, next) {
  var gameData = {
    name: req.body.name || '',
  };

  if (gameData.name.length === 0) {
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
