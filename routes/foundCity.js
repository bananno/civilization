const express = require('express');
const router = express.Router();
const getData = require('./getData');
const helpers = require('./helpers');
const Unit = require('../models/unit');
const City = require('../models/city');

router.post('/foundCity/:unitId', (req, res, next) => {
  let unitId = req.params.unitId;
  getData(req, res, next, (data) => {
    let [numRows, numCols] = data.game.mapSize;

    let unit = helpers.findUnit(data.units, unitId);

    if (unit == null || unit.templateName != 'settler' || unit.movesRemaining == 0
        || '' + unit.player != '' + data.turnPlayerId) {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    let tile = helpers.findTile(data.tiles, unit.location);

    if (tile.player) {
      if ('' + tile.player != '' + data.turnPlayerId) {
        console.log('Cannot build a city in another player\'s territory.');
        return res.redirect('/');
      }
    }

    let cityData = {
      game: data.game,
      player: unit.player,
      location: unit.location,
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

    let playerCities = data.cities.filter(city => {
      return city.player == unit.player;
    });

    if (playerCities.length == 0) {
      cityData.buildings.push(0);
    }

    City.create(cityData, (error, city) => {
      if (error) {
        return next(error);
      }

      Unit.deleteOne(unit, error => {
        if (error) {
          return next(error);
        }

        let tilesToUpdate = [];
        let tileAlreadyCovered = {};

        // UPDATE THE TILE WHERE THE CITY IS BUILT.
        // The city tile itself is automatically worked by the city.
        // Remove any terrain features (forest) automatically.
        // Automatically build a road in the city.

        let cityTile = helpers.findTile(data.tiles, city.location);
        let tileUpdate = {
          improvement: 'city',
          worked: city,
          road: true,
        };

        if (cityTile.terrain.forest) {
          tileUpdate.terrain = tile.terrain;
          tileUpdate.terrain.forest = false;
        }

        tilesToUpdate.push({
          tile: cityTile,
          update: tileUpdate,
        });

        tileAlreadyCovered[city.location.join(',')] = true;

        // CLAIM THE 6 TILES AROUND THE CITY IF THEY ARE AVAILABLE.

        let cityBorderCoords = [];

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

        const claimTile = (i) => {
          if (i >= tilesToUpdate.length) {
            return res.redirect('/');
          }

          let tile = tilesToUpdate[i].tile;
          let tileData = tilesToUpdate[i].update;

          tile.update(tileData, error => {
            if (error) {
              return next(error);
            }
            claimTile(i + 1);
          });
        }

        claimTile(0);
      });
    });
  });
});

module.exports = router;
