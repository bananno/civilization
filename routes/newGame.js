const express = require('express');
const router = express.Router();

const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const Unit = require('../models/unit');

router.post('/newGame', (req, res, next) => {
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

      let tileList = [];

      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          let tileData = {
            game: game,
            row: i,
            column: j,
            discovered: [],
          };
          tileList.push(tileData);
        }
      }

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

          tileList = setTilesDiscovered(tileList, tempUnit1, player);
          tileList = setTilesDiscovered(tileList, tempUnit2, player);

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
                createTile(0);
              }
            });
          });
        });
      };

      const createTile = (i) => {
        if (i >= tileList.length) {
          res.redirect('/');
        } else {
          Tile.create(tileList[i], (error, tile) => {
            if (error) {
              return next(error);
            }
            createTile(i + 1);
          });
        }
      }

      createPlayer(0);
    }
  });
});

function setTilesDiscovered(tileList, unit, player) {
  let startRow = unit.location[0] - 1;
  let endRow = unit.location[0] + 1;
  let startCol = unit.location[1] - 1;
  let endCol = unit.location[1] + 1;

  for (let row = startRow; row <= endRow; row++) {
    if (row < 0) {
      continue;
    }
    if (row == 10) {
      break;
    }
    for (let tempCol = startCol; tempCol <= endCol; tempCol++) {
      let col = tempCol;
      if (col < 0) {
        col = 9;
      } else if (col == 10) {
        col = 0;
      }

      console.log(player.name + ' discovered: ' + row + ', ' + col);
    }
  }

  return tileList;
}

module.exports = router;
