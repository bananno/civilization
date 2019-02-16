const express = require('express');
const router = express.Router();
const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const Unit = require('../models/unit');
const mapPatterns = require('../models/mapPatterns');
const createUnit = require('./createUnit');
const helpers = require('./helpers');
const getVisibleTilesFunction = require('./getVisibleTiles');

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
      let tempRefMap = [];

      for (let r = 0; r < game.mapSize[0]; r++) {
        tempRefMap[r] = [];
        for (let c = 0; c < game.mapSize[1]; c++) {
          let tileData = {
            game: game,
            location: [r, c],
            discovered: [],
            production: {
              food: 1,
              gold: 1,
              labor: 1,
              culture: 0,
              science: 0,
            },
            terrain: {
              ground: 'grassland',
              forest: false,
              hill: false,
              mountain: false,
              water: false,
            },
          };

          let mountain = helpers.booleanByPercentage(5);

          if (mountain) {
            tileData.terrain.mountain = true;
            tileData.production.food = 0;
            tileData.production.gold = 0;
            tileData.production.labor = 0;
          } else {
            let hill = helpers.booleanByPercentage(25);
            let forest = helpers.booleanByPercentage(40);
            tileData.terrain.hill = hill;
            tileData.terrain.forest = forest;
          }

          tempRefMap[r][c] = tileData;

          tileList.push(tileData);
        }
      }

      for (let count = 0; count < 10; count++) {
        let patternNumber = helpers.getRandomInt(0, mapPatterns.water.length - 1);
        let pattern = mapPatterns.water[patternNumber];
        let startRangeRow = 0 - pattern.length;
        let endRangeRow = game.mapSize[0] + pattern.length;

        let startRow = helpers.getRandomInt(startRangeRow, endRangeRow);
        let startCol = helpers.getRandomInt(0, game.mapSize[1]);

        for (let r1 = 0; r1 < pattern.length; r1++) {
          let r = startRow + r1;
          if (r < 0) {
            continue;
          }
          if (r >= game.mapSize[0]) {
            break;
          }
          for (let c1 = 0; c1 < pattern[0].length; c1++) {
            if (pattern[r1][c1] == 1) {
              let c = helpers.getColumn(game.mapSize[1], startCol + c1);
              tempRefMap[r][c].terrain.ground = null;
              tempRefMap[r][c].terrain.water = true;
              tempRefMap[r][c].terrain.hill = false;
              tempRefMap[r][c].terrain.forest = false;
            }
          }
        }
      }

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
            location: tempUnitLocations[tempUnitLocationCount],
            unitTypeIndex: 0,
          };

          var tempUnit2 = {
            game: game,
            player: player,
            location: tempUnitLocations[tempUnitLocationCount + 1],
            unitTypeIndex: 1,
          };

          tempUnitLocationCount += 2;

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

module.exports = router;
