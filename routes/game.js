const express = require('express');
const router = express.Router();
const Game = require('../models/game');
const getData = require('./getData');
const helpers = require('./helpers');
const getVisibleTilesFunction = require('./getVisibleTiles');

router.get('/', getHomePage);
router.get('/newGame', newGameGet);
router.get('/loadGame', loadGameGet);
router.get('/loadGame/:gameId', loadGamePost);
router.get('/exitGame', exitGame);

function getHomePage(req, res, next) {
  getData(req, res, next, (data) => {
    data.helpers = helpers;
    data.getVisibleTiles = getVisibleTilesFunction(data);
    res.render('game/index', data);
  });
}

function loadGameGet(req, res, next) {
  Game.find({ }, function (error, games) {
    if (error) {
      res.send({ message: 'ERROR: ' + error });
    } else {
      if (games.length === 0) {
        res.redirect('/newGame');
      } else {
        res.render('loadGame', {
          games: games
        });
      }
    }
  });
}

function loadGamePost(req, res, next) {
  req.session.gameId = req.params.gameId;
  res.redirect('/');
}

function newGameGet(req, res, next) {
  Game.find({ }, function (error, games) {
    if (error) {
      return res.send({ message: 'ERROR: ' + error });
    }
    res.render('newGame', {
      numberOfGames: games.length
    });
  });
}

function exitGame(req, res, next) {
  if (req.session) {
    req.session.destroy((error) => {
      if (error) {
        next(error);
      } else {
        res.redirect('/loadGame');
      }
    });
  }
}

module.exports = router;
