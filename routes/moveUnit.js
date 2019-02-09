const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/moveUnit/:unitId/:row/:col', (req, res, next) => {
  let unitId = req.params.unitId;
  let newRow = parseInt(req.params.row);
  let newCol = parseInt(req.params.col);

  getData(req, res, next, (data) => {
    let numMapRows = data.game.mapSize[0];
    let numMapCols = data.game.mapSize[1];

    let unit = data.units.filter(unit => {
      return unit._id == unitId;
    })[0];

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

      if (newRow != oldRow && newCol != oldCol) {
        return false;
      }

      let wrapColumn = (oldCol == 0 && newCol == numMapCols - 1)
        || (oldCol == numMapCols - 1 && newCol == 0);
      let oneColAway = Math.abs(oldCol - newCol) == 1 || wrapColumn;
      let oneRowAway = Math.abs(oldRow - newRow) == 1;

      if (!(oneColAway || wrapColumn) && !oneRowAway) {
        return false;
      }

      let unitsInNewSpace = data.units.filter(otherUnit => {
        return otherUnit.location[0] == newRow
          && otherUnit.location[1] == newCol;
      });

      if (unitsInNewSpace.length) {
        return false;
      }

      newTile = findTile(data.tiles, newRow, newCol);

      if (newTile.terrain.mountain) {
        return false;
      }

      return true;
    })();

    let tileList = [];

    if (legalMove) {
      let movesUsed = 1;

      if (newTile.terrain.hill || newTile.terrain.forest) {
        if (unit.unitType.name != 'scout') {
          movesUsed += 1;
        }
      }

      unitData.location = [newRow, newCol];
      unitData.movesRemaining = unit.movesRemaining - movesUsed;
      unitData.orders = null;

      if (unitData.movesRemaining < 0) {
        unitData.movesRemaining = 0;
      }

      let newTiles = getNewlyDiscoveredTiles(data.game.mapSize, newRow, newCol);

      newTiles.forEach(coords => {
        let tile = data.tiles.filter(tile => {
          return tile.row == coords[0] && tile.column == coords[1];
        })[0];
        if (tile) {
          tileList.push(tile);
        }
      });
    } else {
      console.log('Invalid unit move.');
      return res.redirect('/');
    }

    const updateTile = (i) => {
      if (i >= tileList.length) {
        return res.redirect('/');
      }
      let tileData = {
        discovered: tileList[i].discovered
      };
      tileData.discovered.push(unit.player);
      tileList[i].update(tileData, (error, tile) => {
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

function getNewlyDiscoveredTiles(mapSize, newRow, newCol) {
  let numMapRows = mapSize[0];
  let numMapCols = mapSize[1];
  let tiles = [];

  for (let r = newRow - 2; r <= newRow + 2; r++) {
    if (r < 0) {
      continue;
    }
    if (r >= numMapRows) {
      break;
    }
    for (let cTemp = newCol - 2; cTemp <= newCol + 1; cTemp++) {
      let c = cTemp;
      if (c < 0) {
        c += numMapCols;
      } else if (c >= numMapCols) {
        c -= numMapCols;
      }
      tiles.push([r, c]);
    }
  }

  return tiles;
}

function findTile(tiles, row, column) {
  return tiles.filter(tile => {
    return tile.row == row && tile.column == column;
  })[0];
}

module.exports = router;
