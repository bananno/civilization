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

        let cityTiles = [];

        let tilesInCity = [];
        let tilesAroundCity = [];

        let covered = {};
        covered[city.location.join(',')] = true;

        helpers.forEachAdjacentTile(numRows, numCols, data.tiles, city.location[0],
            city.location[1], (tile, r, c) => {
          covered[r + ',' + c] = true;
          tilesInCity.push([tile, r, c]);
        });

        tilesInCity.forEach(arr => {
          let [tile, r, c] = arr;

          helpers.forEachAdjacentTile(numRows, numCols, data.tiles, r, c, (tile, r, c) => {
            if (covered[r + ',' + c]) {
              return;
            }
            covered[r + ',' + c] = true;
            tilesAroundCity.push([tile, r, c]);
          });
        });

        console.log(tilesInCity.length)
        console.log(tilesAroundCity.length)

        let startRowCity = city.location[0] - 1;
        let endRowCity = city.location[0] + 1;
        let startColCity = city.location[1] - 1;
        let endColCity = city.location[1] + 1;

        let startRow = startRowCity - 1;
        let endRow = endRowCity + 1;
        let startCol = startColCity - 1;
        let endCol = endColCity + 1;

        const shiftBackwards = city.location[0] % 2 == 0;

        const tileIsInNewCityBorders = (tile, r, cTemp) => {
          if (r < startRowCity || r > endRowCity
              || cTemp < startColCity || cTemp > endColCity) {
            return false;
          }
          if (r != city.location[0]) {
            if (city.location[0] % 2 == 0) {
              if (cTemp == city.location[1] - 1) {
                return false;
              }
            } else {
              if (cTemp == city.location[1] + 1) {
                return false;
              }
            }
          }
          return tile.player == null;
        };

        for (let r = startRow; r <= endRow; r++) {
          if (r < 0) {
            continue;
          }
          if (r >= numRows) {
            break;
          }

          for (let cTemp = startCol; cTemp <= endCol; cTemp++) {
            let c = helpers.getColumn(numCols, cTemp);
            let tile = helpers.findTile(data.tiles, r, c);

            if (tile) {
              let tileObj = {};

              tileObj.discovered = tile.discovered;
              tileObj.discovered.push(city.player);

              if (tileIsInNewCityBorders(tile, r, cTemp)) {
                tileObj.player = city.player;
              }

              // The city tile itself is automatically worked by the city.
              // Remove any terrain features (forest) automatically.
              // Automatically build a road in the city.
              if (helpers.sameLocation(city.location, [r, c])) {
                tileObj.improvement = 'city';
                tileObj.worked = city;
                if (tile.terrain.forest) {
                  tileObj.terrain = tile.terrain;
                  tileObj.terrain.forest = false;
                }
                tileObj.road = true;
              }

              cityTiles.push({
                tile: tile,
                update: tileObj,
              });
            }
          }
        }

        const claimTile = (i) => {
          if (i >= cityTiles.length) {
            return res.redirect('/');
          }

          let tile = cityTiles[i].tile;
          let tileData = cityTiles[i].update;

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
