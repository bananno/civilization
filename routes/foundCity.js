const express = require('express');
const router = express.Router();
const getData = require('./getData');

const Unit = require('../models/unit');

router.post('/foundCity/:unitId', (req, res, next) => {
  let unitId = req.params.unitId;
  getData(req, res, next, (data) => {
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

      let startRow = cityLocation[0] - 1;
      let endRow = cityLocation[0] + 1;
      let startCol = cityLocation[1] - 1;
      let endCol = cityLocation[1] + 1;

      if (startRow < 0) {
        startRow = 0;
      }
      if (endRow > 9) {
        endRow = 9;
      }

      let cityTiles = [];

      for (let row = startRow; row <= endRow; row++) {
        for (let col1 = startCol; col1 <= endCol; col1++) {
          let col = col1;
          if (col < 0) {
            col = 9;
          } else if (col > 9) {
            col = 9;
          }

          let tile = data.tiles.filter(tile => {
            return tile.row == row && tile.column == col;
          })[0];

          if (tile && tile.owner == null) {
            cityTiles.push(tile);
          }
        }
      }

      const claimTile = (i) => {
        if (i >= cityTiles.length) {
          return res.redirect('/');
        }
        cityTiles[i].update({ owner: cityOwner }, (error, tile) => {
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
