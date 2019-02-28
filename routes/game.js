const express = require('express');
const router = express.Router();
const Game = require('../models/game');
const getData = require('./getData');
const helpers = require('./helpers');
const getVisibleTilesFunction = require('./support/getVisibleTiles');

router.get('/', getHomePage);
router.get('/newGame', newGameGet);
router.get('/loadGame', loadGameGet);
router.get('/loadGame/:gameId', loadGamePost);
router.get('/exitGame', exitGame);
router.post('/zoom', zoom);

const zoomLimit = [1, 3];

function getHomePage(req, res, next) {
  getData(req, res, next, (data) => {
    data.helpers = helpers;
    data.getVisibleTiles = getVisibleTilesFunction(data);
    data.zoomLimit = zoomLimit;
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
  let direction = parseInt(req.body.direction);

  if (direction == 0) {
    direction = -1;
  } else if (direction != 1) {
    console.log('Invalid input.');
    return res.redirect('/');
  }

  Game.findById(gameId, (error, game) => {
    if (error) {
      return next(error);
    }

    const newZoom = game.zoom + direction;

    if (newZoom < zoomLimit[0] || newZoom > zoomLimit[1]) {
      console.log('Zoom is out of range.');
      return res.redirect('/');
    }

    game.update({ zoom: newZoom }, error => {
      if (error) {
        return next(error);
      }
      res.send();
    });
  });
}

module.exports = router;
