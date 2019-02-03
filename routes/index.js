const express = require('express');
const router = express.Router();

const Game = require('../models/game');
const Player = require('../models/player');
const Unit = require('../models/unit');

router.get('/', getHomePage);
router.post('/endTurn', endTurn);

function withCurrentGame(req, res, next, callback) {
  Game.findById(req.session.gameId, (error, game) => {
    if (error) {
      return next(error);
    }
    if (game == null) {
      return res.redirect('/loadGame');
    }
    Player.find({ game: game }, (error, players) => {
      if (error) {
        return next(error);
      }
      callback(game, players);
    });
  });
}

function getHomePage(req, res, next) {
  withCurrentGame(req, res, next, (game, players) => {
    res.render('index', {
      game: game,
      players: players,
    });
  });
}

function endTurn(req, res, next) {
  withCurrentGame(req, res, next, (game, players) => {
    let gameData = {};
    if (game.nextPlayer < players.length - 1) {
      gameData.nextPlayer = game.nextPlayer + 1;
    } else {
      gameData.nextPlayer = 0;
      gameData.turn = game.turn + 1;
    }
    game.update(gameData, (error, game) => {
      if (error) {
        next(error);
      } else {
        res.redirect('/');
      }
    })
  });
}

module.exports = router;
