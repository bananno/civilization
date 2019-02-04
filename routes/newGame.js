const express = require('express');
const router = express.Router();

const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const Unit = require('../models/unit');
const unitTypes = require('../models/unitTypes');

router.post('/newGame', (req, res, next) => {
  var gameData = {
    name: req.body.name || '',
    mapSize: [parseInt(req.body.rows), parseInt(req.body.columns)],
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
      const tempUnitLocations = [[3, 0], [2, 6], [6, 9], [9, 5]];
      let tempUnitLocationCount = 0;

      let tileList = [];

      for (let i = 0; i < game.mapSize[0]; i++) {
        for (let j = 0; j < game.mapSize[1]; j++) {
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
            unitType: unitTypes[0],
          };

          var tempUnit2 = {
            game: game,
            player: player,
            location: tempUnitLocations[tempUnitLocationCount + 1],
            unitType: unitTypes[1],
          };

          tempUnitLocationCount += 2;

          tileList = setTilesDiscovered(game, tileList, tempUnit1, player);
          tileList = setTilesDiscovered(game, tileList, tempUnit2, player);

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

function setTilesDiscovered(game, tileList, unit, player) {
  let numMapCols = game.mapSize[1];
  let startRow = unit.location[0] - 1;
  let endRow = unit.location[0] + 1;
  let startCol = unit.location[1] - 1;
  let endCol = unit.location[1] + 1;
  let wrapColumn = false;

  if (startCol < 0) {
    wrapColumn = true;
    startCol = numMapCols + startCol;
  } else if (endCol > numMapCols - 1) {
    wrapColumn = true;
    endCol = endCol - numMapCols;
  }

  return tileList.map(tile => {
    if (tile.row < startRow || tile.row > endRow) {
      return tile;
    }

    if (wrapColumn) {
      if (tile.column < startCol && tile.column > endCol) {
        return tile;
      }
    } else {
      if (tile.column < startCol || tile.column > endCol) {
        return tile;
      }
    }

    tile.discovered.push(player);

    return tile;
  });
}

module.exports = router;
