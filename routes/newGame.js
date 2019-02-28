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

router.post('/newGame', newGame);

async function newGame(req, res, next) {
  const game = await createGame(req.body);

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

async function createGame(params) {
  let numRows = parseInt(params.rows || 0);
  let numCols = parseInt(params.columns || 0);
  let gameName = (params.name || '').trim() || ('Game' + ('' + Math.random()).slice(2, 10));

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
    name: gameName,
    mapSize: [numRows, numCols],
  };

  return await new Promise(resolve => {
    Game.create(gameData, (error, game) => {
      resolve(game);
    });
  });
}

function chooseUnitLocations(tiles, numPlayers) {
  const numCols = tiles[0].length;
  const locations = [];

  const passableTiles = tiles.filter((tile, i) => {
    if (tile.terrain.water || tile.terrain.mountain) {
      return false;
    }
    const nextTile = tiles[i + 1];
    if (nextTile == null || nextTile.terrain.water || nextTile.terrain.mountain) {
      return false;
    }
    return true;
  });

  for (let i = 0; i < numPlayers; i++) {
    while (true) {
      let tileNum = helpers.getRandomInt(0, passableTiles.length - 1);
      let [r1, c1] = passableTiles[tileNum].location;
      let [r2, c2] = [r1, helpers.getColumn(numCols, c1 + 1)];

      const otherPlayersNearby = locations.filter(pair => {
        let [r3, c3] = pair[0];
        return Math.abs(r1 - r3) < 6 && Math.abs(c1 - c3) < 6;
      });

      if (otherPlayersNearby.length > 0) {
        continue;
      }

      locations.push([[r1, c1], [r1, c2]]);
      break;
    }
  }

  return locations;
}

module.exports = router;
