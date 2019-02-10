const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/unitOrders/:orders/:unitId', (req, res, next) => {
  let orders = req.params.orders;
  let unitId = req.params.unitId;

  getData(req, res, next, (data) => {
    let unit = findUnit(data.units, unitId);

    if ('' + unit.player != '' + data.turnPlayerId) {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    let unitData = {};

    if (orders == 'skipTurn') {
      unitData.orders = 'skip turn';
    } else if (orders == 'sleep') {
      unitData.orders = 'sleep';
    } else if (orders == 'wake' || orders == 'cancel') {
      unitData.orders = null;
    } else if (orders == 'buildFarm' || orders == 'chopForest') {
      return improveLand(res, data, unit, orders);
    } else {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    unit.update(unitData, (error, unit) => {
      if (error) {
        return next(error);
      }
      res.redirect('/');
    });
  });
});

function improveLand(res, data, unit, orders) {
  const invalidAction = () => {
    console.log('Invalid unit action.');
    return res.redirect('/');
  };

  let unitData = {};
  let tileData = {};

  let tile = findTile(data.tiles, unit.location);

  let unitType = unit.unitType.name;
  let inForest = tile.terrain.forest;
  let inOwnTerritory = '' + tile.player == '' + data.turnPlayerId;
  let inRivalTerritory = tile.player && !inOwnTerritory;
  let inCity = data.cities.filter(city => city.location[0] == unit.location[0]
      && city.location[1] == unit.location[1]).length > 0;

  if (orders == 'buildFarm') {
    if (inForest || inCity || !inOwnTerritory || unitType != 'worker'
        || tile.improvement != null) {
      return invalidAction();
    }
    unitData.orders = 'build farm';

    if (tile.improvement != 'build farm') {
      tileData.improvement = 'build farm';
      tileData.progress = 0;
    }
  } else if (orders == 'chopForest') {
    if (!inForest || inRivalTerritory || unitType != 'worker') {
      return invalidAction();
    }
    unitData.orders = 'chop forest';

    if (tile.improvement != 'chop forest') {
      tileData.improvement = 'chop forest';
      tileData.progress = 0;
    }
  }

  unit.update(unitData, (error, unit) => {
    if (error) {
      return next(error);
    }
    tile.update(tileData, (error, tile) => {
      if (error) {
        return next(error);
      }
      res.redirect('/');
    });
  });
}

function findUnit(units, id) {
  return units.filter(unit => {
    return unit._id == id;
  })[0];
}

function findTile(tiles, row, column) {
  if (row.constructor == Array) {
    [row, column] = row;
  }
  return tiles.filter(tile => {
    return tile.row == row && tile.column == column;
  })[0];
}

module.exports = router;
