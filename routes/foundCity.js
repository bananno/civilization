const express = require('express');
const router = express.Router();
const getData = require('./getData');
const helpers = require('./helpers');
const Unit = require('../models/unit');
const City = require('../models/city');

router.post('/foundCity/:unitId', (req, res, next) => {
  let unitId = req.params.unitId;
  getData(req, res, next, (data) => {
    let numMapRows = data.game.mapSize[0];
    let numMapCols = data.game.mapSize[1];

    let unit = helpers.findUnit(data.units, unitId);

    if (unit == null || unit.unitType.name != 'settler' || unit.movesRemaining == 0
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

        let startRowCity = city.location[0] - 1;
        let endRowCity = city.location[0] + 1;
        let startColCity = city.location[1] - 1;
        let endColCity = city.location[1] + 1;

        let startRow = startRowCity - 1;
        let endRow = endRowCity + 1;
        let startCol = startColCity - 1;
        let endCol = endColCity + 1;

        for (let r = startRow; r <= endRow; r++) {
          if (r < 0) {
            continue;
          }
          if (r >= numMapCols) {
            break;
          }

          let rowIsInCitySquare = r >= startRowCity && r <= endRowCity;

          for (let cTemp = startCol; cTemp <= endCol; cTemp++) {
            let c = helpers.getColumm(numMapCols, cTemp);
            let tile = helpers.findTile(data.tiles, r, c);

            if (tile) {
              let tileObj = {};

              tileObj.discovered = tile.discovered;
              tileObj.discovered.push(city.player);

              if (rowIsInCitySquare) {
                if (cTemp >= startColCity && cTemp <= endColCity) {
                  if (tile.player == null) {
                    tileObj.player = city.player;
                  }
                }
              }

              // The city tile itself is automatically worked by the city.
              // Remove any terrain features (forest) automatically.
              // Automatically build a road in the city.
              if (helpers.sameLocation(city.location, [r, c])) {
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
