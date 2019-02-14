const express = require('express');
const router = express.Router();
const getData = require('./getData');
const helpers = require('./helpers');

router.post('/unitOrders/:orders/:unitId', (req, res, next) => {
  let orders = req.params.orders;
  let unitId = req.params.unitId;

  getData(req, res, next, (data) => {
    let unit = helpers.findUnit(data.units, unitId);

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
    } else if (orders == 'buildFarm' || orders == 'buildMine' || orders == 'buildRoad'
        || orders == 'chopForest' || orders == 'removeImprovement') {
      return improveLand(res, next, data, unit, orders);
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

function improveLand(res, next, data, unit, orders) {
  const invalidAction = () => {
    console.log('Invalid unit action.');
    return res.redirect('/');
  };

  let unitData = {};
  let tileData = {};

  let tile = helpers.findTile(data.tiles, unit.location);

  let unitType = unit.unitType.name;
  let inForest = tile.terrain.forest;
  let onHill = tile.terrain.hill;
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

    if (tile.project != 'farm') {
      tileData.project = 'farm';
      tileData.progress = 0;
    }
  } else if (orders == 'buildMine') {
    if (inForest || !onHill || inCity || !inOwnTerritory || unitType != 'worker'
        || tile.improvement != null) {
      return invalidAction();
    }
    unitData.orders = 'build mine';

    if (tile.project != 'mine') {
      tileData.project = 'mine';
      tileData.progress = 0;
    }
  } else if (orders == 'chopForest') {
    if (!inForest || inRivalTerritory || unitType != 'worker') {
      return invalidAction();
    }
    unitData.orders = 'chop forest';

    if (tile.project != 'chop') {
      tileData.project = 'chop';
      tileData.progress = 0;
    }
  } else if (orders == 'removeImprovement') {
    if (inRivalTerritory || unitType != 'worker'
        || (tile.improvement != 'farm' && tile.improvement != 'mine')) {
      return invalidAction();
    }
    unitData.orders = 'remove ' + tile.improvement;
  } else if (orders == 'buildRoad') {
    if (unitType != 'worker') {
      return invalidAction();
    }
    unitData.orders = 'build road';
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

module.exports = router;
