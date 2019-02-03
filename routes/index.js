const express = require('express');
const router = express.Router();
const Game = require('../models/game');

router.get('/', getHomePage);

function authenticate(req, res, next, callback) {
  Game.findById(req.session.gameId, (error, game) => {
    if (error) {
      return next(error);
    } else {
      if (game == null) {
        console.log('No game found.');
        res.redirect('login');
      } else {
        callback(game);
      }
    }
  });
}

function getHomePage(req, res, next) {
  authenticate(req, res, next, (game) => {
    if (game) {
      res.render('index', {
        game: game,
      });
    } else {
      res.redirect('/loadGame');
    }
  });
}

module.exports = router;
