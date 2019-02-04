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

      const numPlayers = 2;
      const tempUnitLocations = [[3, 2], [2, 6], [6, 7], [7, 5]];
      let tempUnitLocationCount = 0;

      const createPlayer = (i) => {
        var playerData = {
          game: game,
          name: req.body['playername_' + i].trim() || 'Player ' + (i + 1),
        };

        Player.create(playerData, (error, player) => {
          if (error) {
            return next(error);
          }

          var tempUnit1 = {
            game: game,
            player: player,
            location: tempUnitLocations[tempUnitLocationCount],
          };

          var tempUnit2 = {
            game: game,
            player: player,
            location: tempUnitLocations[tempUnitLocationCount + 1],
          };

          tempUnitLocationCount += 2;

          Unit.create(tempUnit1, (error, unit1) => {
            if (error) {
              return next(error);
            }
            Unit.create(tempUnit2, (error, unit2) => {
              if (error) {
                return next(error);
              }

              if (i < numPlayers - 1) {
                createPlayer(i + 1);
              } else {
                createTile(0, 0);
              }
            });
          });
        });
      };

      const createTile = (row, col) => {
        if (row == 10) {
          res.redirect('/');
        } else if (col == 10) {
          createTile(row + 1, 0);
        } else {
          createTile(row, col + 1);
        }
      }

      createPlayer(0);
    }
  });
}

module.exports = router;
