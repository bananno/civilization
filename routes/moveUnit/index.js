const {
  Unit,
  Tile,
  getData,
  getVisibleTilesFunction,
} = require('../import');

const getMoveUnitError = require('./getMoveUnitError');
const getMovesUsed = require('./getMovesUsed');

module.exports = moveUnit;

function moveUnit(req, res, next){
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

    unitData.location = [newRow, newCol];
    unitData.movesRemaining = unit.movesRemaining - getMovesUsed(unit, oldTile, newTile);
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
}
