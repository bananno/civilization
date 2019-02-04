const express = require('express');
const router = express.Router();
const getData = require('./getData');
const Unit = require('../models/unit');

router.post('/moveUnit/:unitId/:row/:col', moveUnit);

function moveUnit(req, res, next) {
  let unitId = req.params.unitId;
  let newRow = parseInt(req.params.row);
  let newCol = parseInt(req.params.col);

  getData(req, res, next, (data) => {
    Unit.findById(unitId, (error, unit) => {
      if (error) {
        return next(error);
      }

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

        let newTiles = [];

        if (newRow != oldRow) {
          let temp = newRow  + (newRow > oldRow ? 1 : -1);
          if (temp >= 0 && temp < 10) {
            newTiles = [[temp, newCol - 1], [temp, newCol], [temp, newCol + 1]];
          }
        }

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
}

module.exports = router;
