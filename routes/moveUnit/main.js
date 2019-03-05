const express = require('express');
const router = express.Router();
const Unit = require('../../models/unit');
const Tile = require('../../models/tile');
const getData = require('../getData');
const getVisibleTilesFunction = require('../support/getVisibleTiles');

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

function getMoveUnitError(data, unit, oldRow, oldCol, newRow, newCol, newTile) {
  const [numRows, numCols] = data.game.mapSize;

  if (unit.movesRemaining == 0) {
    return 'Unit has no moves left.';
  }

  if (newRow < 0 || newRow >= numRows) {
    return 'Destination is not a valid location.';
  }

  if (!data.help.isTileAdjacent(oldRow, oldCol, newRow, newCol)) {
    return 'Destination is not adjacent to origin.';
  }

  const unitsInNewSpace = data.units.filter(otherUnit => {
    return data.help.isSameLocation(otherUnit.location, [newRow, newCol]);
  });

  if (unitsInNewSpace.length) {
    return 'Destination is already occupied by another unit.';
  }

  if (newTile.improvement == 'city') {
    const cityInNewSpace = data.cities.filter(city => {
      return data.help.isSameLocation(city.location, [newRow, newCol]);
    })[0];

    if (!data.help.isCurrentPlayer(cityInNewSpace.player)) {
      return 'Unit cannot enter a rival city.';
    }
  }

  if (newTile.terrain.mountain) {
    return 'Mountain tile is impassable.';
  }

  if (unit.templateName == 'galley') {
    if (!newTile.terrain.water && newTile.improvement != 'city') {
      return 'Land tile is impassable.';
    }
  } else if (newTile.terrain.water){
    return 'Water tile is impassable.';
  }

  return null;
}

module.exports = router;
