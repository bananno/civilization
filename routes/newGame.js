const express = require('express');
const router = express.Router();
const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const Unit = require('../models/unit');
const unitTypes = require('../models/unitTypes');
const createUnit = require('./createUnit');
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

      for (let i = 0; i < game.mapSize[0]; i++) {
        for (let j = 0; j < game.mapSize[1]; j++) {
          let tileData = {
            game: game,
            row: i,
            column: j,
            discovered: [],
            food: 1,
            gold: 1,
            terrain: {
              ground: 'grassland',
              forest: false,
              hill: false,
              mountain: false,
            },
          };

          let mountain = Math.round(Math.random()*20) > 18;

          if (mountain) {
            tileData.terrain.mountain = true;
          } else {
            let hill = Math.round(Math.random()*20) > 15;
            let forest = Math.round(Math.random()*20) > 12;
            tileData.terrain.hill = hill;
            tileData.terrain.forest = forest;
          }

          tileList.push(tileData);
        }
      }

      const getVisibleTiles = getVisibleTilesFunction({
        mapSize: game.mapSize,
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
            let [r, c] = pair;
            tileList = tileList.map(tile => {
              if (tile.row == r && tile.column == c) {
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
