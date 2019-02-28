const express = require('express');
const router = express.Router();
const getData = require('./getData');
const helpers = require('./helpers');
const getVisibleTilesFunction = require('./support/getVisibleTiles');

router.post('/moveUnit/:unitId/:row/:col', (req, res, next) => {
  let unitId = req.params.unitId;
  let newRow = parseInt(req.params.row);
  let newCol = parseInt(req.params.col);

  getData(req, res, next, (data) => {
    const getVisibleTiles = getVisibleTilesFunction(data);
    const numCols = data.game.mapSize[1];

    let numMapRows = data.game.mapSize[0];
    let numMapCols = data.game.mapSize[1];

    const unit = helpers.findUnit(data.units, unitId);

    let oldRow = unit.location[0];
    let oldCol = unit.location[1];
    let unitData = {};
    let newTile;

    let legalMove = (() => {
      if (unit.movesRemaining == 0) {
        return false;
      }

      if (newRow < 0 || newRow >= numMapRows) {
        return false;
      }

      if (!helpers.isTileAdjacent(numCols, oldRow, oldCol, newRow, newCol)) {
        return false;
      }

      let unitsInNewSpace = data.units.filter(otherUnit => {
        return otherUnit.location[0] == newRow
          && otherUnit.location[1] == newCol;
      });

      if (unitsInNewSpace.length) {
        return false;
      }

      newTile = helpers.findTile(data.tiles, newRow, newCol);

      if (newTile.terrain.mountain) {
        return false;
      }

      if (unit.templateName == 'galley') {
        return newTile.terrain.water || newTile.improvement == 'city';
      } else {
        return !newTile.terrain.water;
      }

      return true;
    })();

    let tileList = [];

    if (legalMove) {
      let movesUsed = 1;

      if (newTile.terrain.hill || newTile.terrain.forest) {
        if (unit.templateName != 'scout') {
          movesUsed += 1;
        }
      }

      let oldTile = helpers.findTile(data.tiles, oldRow, oldCol);

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

      tileList = getVisibleTiles(newRow, newCol);
    } else {
      console.log('Invalid unit move.');
      return res.redirect('/');
    }

    const updateTile = (i) => {
      if (i >= tileList.length) {
        return res.redirect('/');
      }
      let tile = helpers.findTile(data.tiles, tileList[i]);
      let tileData = {
        discovered: tile.discovered
      };
      tileData.discovered.push(unit.player);
      tile.update(tileData, error => {
        if (error) {
          return next(error);
        }
        updateTile(i + 1);
      });
    }

    unit.update(unitData, (error, unit) => {
      if (error) {
        return next(error);
      }
      updateTile(0);
    });
  });
});

module.exports = router;
