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
router.post('/zoom/:direction', zoom);

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

function zoom(req, res, next) {
  const gameId = req.session.gameId;
  const direction = parseInt(req.params.direction);
  Game.findById(gameId, (error, game) => {
    if (error) {
      return next(error);
    }
    if (direction == 0) {
      if (game.zoom == 1) {
        console.log('Zoom is already at the minimum.');
        return res.redirect('/');
      }
      console.log('Zoom out');
      return res.redirect('/');
    }
    if (direction == 1) {
      if (game.zoom == 2) {
        console.log('Zoom is already at the maximum.');
        return res.redirect('/');
      }
      console.log('Zoom in');
      return res.redirect('/');
    }
    console.log('Invalid input.');
    return res.redirect('/');
  });
}

module.exports = router;
