const express = require('express');
const router = express.Router();
const getData = require('./getData');

const Unit = require('../models/unit');
const City = require('../models/city');

router.post('/foundCity/:unitId', (req, res, next) => {
  let unitId = req.params.unitId;
  getData(req, res, next, (data) => {
    let numMapRows = data.game.mapSize[0];
    let numMapCols = data.game.mapSize[1];

    let unit = data.units.filter(unit => {
      return unit._id == unitId;
    })[0];

    let turnPlayerId = data.players[data.game.nextPlayer]._id;

    if (unit.unitType.name != 'settler' || unit.movesRemaining == 0
        || '' + unit.player != '' + turnPlayerId) {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    let cityData = {
      game: data.game,
      player: unit.player,
      location: unit.location,
      buildings: [],
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

        for (let row = startRow; row <= endRow; row++) {
          if (row < 0) {
            continue;
          }
          if (row >= numMapCols) {
            break;
          }

          let isCityRow = row >= startRowCity && row <= endRowCity;

          for (let col1 = startCol; col1 <= endCol; col1++) {
            let isCityCol = col1 >= startColCity && col1 <= endColCity;
            let col = col1;
            if (col < 0) {
              col += numMapCols;
            } else if (col > numMapCols - 1) {
              col -= numMapCols;
            }

            let tile = data.tiles.filter(tile => {
              return tile.row == row && tile.column == col;
            })[0];

            if (tile) {
              let tileObj = {
                tile: tile,
                update: {}
              };

              tileObj.update.discovered = tile.discovered;
              tileObj.update.discovered.push(city.player);

              if (isCityRow && isCityCol) {
                if (tile.owner == null) {
                  tileObj.update.owner = city.player;
                }
              }

              cityTiles.push(tileObj);
            }
          }
        }

        const claimTile = (i) => {
          if (i >= cityTiles.length) {
            return res.redirect('/');
          }
          cityTiles[i].tile.update(cityTiles[i].update, (error, tile) => {
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
