const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/moveUnit/:unitId/:row/:col', (req, res, next) => {
  let unitId = req.params.unitId;
  let newRow = parseInt(req.params.row);
  let newCol = parseInt(req.params.col);

  getData(req, res, next, (data) => {
    let unit = data.units.filter(unit => {
      return unit._id == unitId;
    })[0];

    let oldRow = unit.location[0];
    let oldCol = unit.location[1];
    let unitData = {};

    let legalMove = (() => {
      if (unit.movesRemaining == 0) {
        return false;
      }

      if (newRow < 0 || newCol >= 10) {
        return false;
      }

      if (newRow != oldRow && newCol != oldCol) {
        return false;
      }

      let wrapColumn = (oldCol == 0 && newCol == 9) || (oldCol == 9 && newCol == 0);
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

      return true;
    })();

    let tileList = [];

    if (legalMove) {
      unitData.location = [newRow, newCol];
      unitData.movesRemaining = unit.movesRemaining - 1;

      let newTiles = getNewlyDiscoveredTiles(oldRow, oldCol, newRow, newCol);

      newTiles.forEach(coords => {
        let tile = data.tiles.filter(tile => {
          return tile.row == coords[0] && tile.column == coords[1];
        })[0];
        if (tile) {
          tileList.push(tile);
        }
      });
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

function getNewlyDiscoveredTiles(oldRow, oldCol, newRow, newCol) {
  if (newRow != oldRow) {
    let tempRow = newRow + (newRow > oldRow ? 1 : -1);
    if (tempRow < 0 || tempRow >= 10) {
      return [];
    }
    return [[tempRow, newCol - 1], [tempRow, newCol], [tempRow, newCol + 1]];
  }

  if (newCol != oldCol) {
    let tempCol = newCol + (newCol > oldCol ? 1 : -1);
    if (tempCol < 0) {
      tempCol = 9;
    } else if (tempCol > 9) {
      tempCol = 0;
    }
    return [[newRow - 1, tempCol], [newRow, tempCol], [newRow + 1, tempCol]];
  }

  return [];
}

module.exports = router;
