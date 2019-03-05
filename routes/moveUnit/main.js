const express = require('express');
const router = express.Router();
const Unit = require('../../models/unit');
const Tile = require('../../models/tile');
const getData = require('../getData');
const getVisibleTilesFunction = require('../support/getVisibleTiles');
const getMoveUnitError = require('./getMoveUnitError');

router.post('/moveUnit/:unitId/:row/:col', (req, res, next) => {
  const unitId = req.params.unitId;
  const newRow = parseInt(req.params.row);
  const newCol = parseInt(req.params.col);

  getData(req, res, next, (data) => {
    const getVisibleTiles = getVisibleTilesFunction(data);
    const unit = data.unitRef[unitId];

    const [oldRow, oldCol] = unit.location;
    const unitData = {};

    const oldTile = data.help.findTile(oldRow, oldCol);
    const newTile = data.help.findTile(newRow, newCol);
    const errorMsg = getMoveUnitError(data, unit, oldRow, oldCol, newRow, newCol, newTile);

    if (errorMsg) {
      const error = new Error(errorMsg);
      error.status = 412;
      return next(error);
    }

    let movesUsed = 1;

    if (newTile.terrain.hill || newTile.terrain.forest) {
      if (unit.templateName != 'scout') {
        movesUsed += 1;
      }
    }

    if (newTile.road && oldTile.road) {
      movesUsed = Math.ceil(movesUsed / 2);
    }

    unitData.location = [newRow, newCol];
    unitData.movesRemaining = unit.movesRemaining - movesUsed;
    unitData.orders = null;
    unitData.automate = false;

    if (unitData.movesRemaining < 0) {
      unitData.movesRemaining = 0;
    }

    const tileList = getVisibleTiles(newRow, newCol);

    const updateTile = (i) => {
      if (i >= tileList.length) {
        return res.redirect('/');
      }

      const tile = data.help.findTile(tileList[i]);

      if (tile == null) {
        updateTile(i + 1);
      }

      const tileData = {
        discovered: tile.discovered
      };

      tileData.discovered.push(unit.player);

      Tile.update(tile, tileData, error => {
        if (error) {
          return next(error);
        }
        updateTile(i + 1);
      });
    }

    Unit.update(unit, unitData, error => {
      if (error) {
        return next(error);
      }
      updateTile(0);
    });
  });
});

module.exports = router;
