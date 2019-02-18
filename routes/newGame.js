const express = require('express');
const router = express.Router();
const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const Unit = require('../models/unit');
const createUnit = require('./createUnit');
const createMap = require('./createMap');
const helpers = require('./helpers');
const getVisibleTilesFunction = require('./getVisibleTiles');

router.post('/newGame', (req, res, next) => {
  let numRows = parseInt(req.body.rows || 0);
  let numCols = parseInt(req.body.columns || 0);

  if (numRows < 10) {
    numRows = 10;
  } else if (numRows > 30) {
    numRows = 30;
  }

  if (numCols < 20) {
    numCols = 20;
  } else if (numCols > 50) {
    numCols = 50;
  }

  const gameData = {
    name: req.body.name || '',
    mapSize: [numRows, numCols],
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

      let tileList = createMap(game);

      const unitLocations = chooseUnitLocations(tileList, numPlayers);

      const getVisibleTiles = getVisibleTilesFunction({
        game: { mapSize: game.mapSize },
        tiles: tileList,
      });

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
            location: unitLocations[i][0],
            templateName: 'settler',
          };

          var tempUnit2 = {
            game: game,
            player: player,
            location: unitLocations[i][1],
            templateName: 'scout',
          };

          let revealedTiles = [];

          revealedTiles = revealedTiles.concat(getVisibleTiles(tempUnit1.location));
          revealedTiles = revealedTiles.concat(getVisibleTiles(tempUnit2.location));

          revealedTiles.forEach(pair => {
            tileList = tileList.map(tile => {
              if (helpers.sameLocation(pair, tile.location)) {
                tile.discovered.push(player);
              }
              return tile;
            });
          });

          createUnit(tempUnit1, () => {
            createUnit(tempUnit2, () => {
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

function chooseUnitLocations(map, numPlayers) {
  const locations = [];

  locations.push([[3, 0], [2, 6]]);
  locations.push([[6, 9], [9, 5]]);

  return locations;
}

module.exports = router;
