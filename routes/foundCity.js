const express = require('express');
const router = express.Router();
const getData = require('./getData');

const Unit = require('../models/unit');

router.post('/foundCity/:unitId', (req, res, next) => {
  let unitId = req.params.unitId;
  getData(req, res, next, (data) => {
    let numMapRows = data.game.mapSize[0];
    let numMapCols = data.game.mapSize[1];

    let unit = data.units.filter(unit => {
      return unit._id == unitId;
    })[0];

    if (unit.unitType.name != 'settler' || unit.movesRemaining == 0) {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    let cityLocation = unit.location;
    let cityOwner = unit.player;

    Unit.deleteOne(unit, error => {
      if (error) {
        return next(error);
      }

      let cityTiles = [];

      let startRowCity = cityLocation[0] - 1;
      let endRowCity = cityLocation[0] + 1;
      let startColCity = cityLocation[1] - 1;
      let endColCity = cityLocation[1] + 1;

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
            col = numMapCols - 1;
          } else if (col > numMapCols - 1) {
            col = 0;
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
            tileObj.update.discovered.push(cityOwner);

            if (isCityRow && isCityCol) {
              if (tile.owner == null) {
                tileObj.update.owner = cityOwner;
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

module.exports = router;
