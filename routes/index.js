const express = require('express');
const router = express.Router();
const Game = require('../models/game');
const Player = require('../models/player');

router.get('/', getHomePage);
router.post('/endTurn', endTurn);

function authenticate(req, res, next, callback) {
  Game.findById(req.session.gameId, (error, game) => {
    if (error) {
      return next(error);
    } else {
      if (game == null) {
        res.redirect('/loadGame');
      } else {
        callback(game);
      }
    }
  });
}

function getHomePage(req, res, next) {
  authenticate(req, res, next, (game) => {
    Player.find({ game: game }, (error, players) => {
      if (error) {
        return next(error);
      }
      console.log(players)
      res.render('index', {
        game: game,
        players: players,
      });
    });
  });
}

function endTurn(req, res, next) {
  authenticate(req, res, next, (game) => {
    let gameData = {
      turn: game.turn + 1
    };
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
