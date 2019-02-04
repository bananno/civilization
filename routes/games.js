const express = require('express');
const router = express.Router();

const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const Unit = require('../models/unit');

router.get('/newGame', newGameGet);
router.post('/newGame', newGamePost);
router.get('/loadGame', loadGameGet);
router.get('/loadGame/:gameId', loadGamePost);
router.get('/exitGame', exitGame);

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

function newGamePost(req, res, next) {
  var gameData = {
    name: req.body.name || '',
  };

  if (gameData.name.length === 0) {
    return res.send({ message: 'All fields are required.' });
  }

  Game.create(gameData, (error, game) => {
    if (error) {
      res.send({ message: 'ERROR: ' + error });
    } else {
      req.session.gameId = game._id;

      var playerData1 = {
        game: game,
        name: req.body.playername_0.trim() || 'Player 1',
      };

      var playerData2 = {
        game: game,
        name: req.body.playername_1.trim() || 'Player 2',
      };

      Player.create(playerData1, (error, player1) => {
        if (error) {
          return next(error);
        }
        Player.create(playerData2, (error, player2) => {
          if (error) {
            return next(error);
          }

          var tempUnit1a = {
            game: game,
            player: player1,
            location: [3, 2],
          };

          var tempUnit1b = {
            game: game,
            player: player1,
            location: [2, 6],
          };

          var tempUnit2a = {
            game: game,
            player: player2,
            location: [6, 7],
          };

          var tempUnit2b = {
            game: game,
            player: player2,
            location: [7, 5],
          };

          Unit.create(tempUnit1a, (error, unit1) => {
            if (error) {
              return next(error);
            }
            Unit.create(tempUnit2a, (error, unit2) => {
              if (error) {
                return next(error);
              }
              Unit.create(tempUnit1b, (error, unit1) => {
                if (error) {
                  return next(error);
                }
                Unit.create(tempUnit2b, (error, unit2) => {
                  if (error) {
                    return next(error);
                  }

                  res.redirect('/');
                });
              });
            });
          });
        });
      });
    }
  });
}

module.exports = router;
