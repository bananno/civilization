const express = require('express');
const router = express.Router();
const getData = require('./getData');
const helpers = require('./helpers');
const Unit = require('../models/unit');
const City = require('../models/city');

router.post('/foundCity/:unitId', (req, res, next) => {
  let unitId = req.params.unitId;
  getData(req, res, next, (data) => {
    const unit = data.unitRef[unitId];

    if (unit == null || unit.templateName != 'settler' || unit.movesRemaining == 0
        || '' + unit.player != '' + data.turnPlayerId) {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    const tile = data.tileRef[unit.location[0]][unit.location[1]];

    if (tile.player && !data.help.isCurrentPlayer(tile.player)) {
      console.log('Cannot build a city in another player\'s territory.');
      return res.redirect('/');
    }

    const cityData = getNewCityObject(data, unit.player, unit.location);

    City.create(cityData, (error, city) => {
      if (error) {
        return next(error);
      }

      Unit.deleteOne(unit, error => {
        if (error) {
          return next(error);
        }

        const tilesToUpdate = [];
        const tileAlreadyCovered = {};

        // UPDATE THE TILE WHERE THE CITY IS BUILT.
        // The city tile itself is automatically worked by the city.
        // Remove any terrain features (forest) automatically.
        // Automatically build a road in the city.

        let tileUpdate = {
          improvement: 'city',
          worked: city,
          road: true,
          player: city.player,
        };

        if (tile.terrain.forest) {
          tileUpdate.terrain = tile.terrain;
          tileUpdate.terrain.forest = false;
        }

        tilesToUpdate.push({
          tile: tile,
          update: tileUpdate,
        });

        tileAlreadyCovered[city.location.join(',')] = true;

        // CLAIM THE 6 TILES AROUND THE CITY IF THEY ARE AVAILABLE.

        const cityBorderCoords = [];

        data.help.forEachAdjacentTile(city.location, (tile, r, c) => {
          tileAlreadyCovered[r + ',' + c] = true;
          if (tile.player) {
            return;
          }
          cityBorderCoords.push([r, c]);
          tilesToUpdate.push({
            tile: tile,
            update: {
              player: city.player,
            },
          });
        });

        // DISCOVER THE 12 TILES ADJACENT TO THE CITY BORDERS.

        cityBorderCoords.forEach(tileCoords => {
          data.help.forEachAdjacentTile(tileCoords, (tile, r, c) => {
            if (tileAlreadyCovered[r + ',' + c]) {
              return;
            }
            tileAlreadyCovered[r + ',' + c] = true;
            tilesToUpdate.push({
              tile: tile,
              update: {
                discovered: tile.discovered.concat(city.player),
              },
            });
          });
        });

        // UPDATE ALL THE TILES IN THE LIST.

        const updateNextTile = (i) => {
          if (i >= tilesToUpdate.length) {
            return res.redirect('/');
          }

          const tile = tilesToUpdate[i].tile;
          const tileData = tilesToUpdate[i].update;

          tile.update(tileData, error => {
            if (error) {
              return next(error);
            }
            updateNextTile(i + 1);
          });
        }

        updateNextTile(0);
      });
    });
  });
});

function getNewCityObject(data, player, location) {
  const newCity = {
    game: data.game,
    player: player,
    location: location,
    buildings: [],
    project: {
      category: null,
      index: null,
    },
    projectProgress: {
      unit: [],
      building: [],
    },
    storage: {
      food: 0,
      labor: 0,
    },
  };

  if (playerHasNoCitiesYet(data, player)) {
    newCity.buildings.push(0);
  }

  return newCity;
}

function playerHasNoCitiesYet(data, player) {
  const playerCities = data.cities.filter(city => {
    return city.player == player;
  });

  return playerCities.length == 0;
}

module.exports = router;
