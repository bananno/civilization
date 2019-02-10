const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/unitOrders/:unitId/:orders', (req, res, next) => {
  let unitId = req.params.unitId;
  let orders = req.params.orders;

  getData(req, res, next, (data) => {
    let unit = data.units.filter(unit => {
      return unit._id == unitId;
    })[0];

    if ('' + unit.player != '' + data.turnPlayerId) {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    let unitData = {};

    if (orders == 'skipTurn') {
      unitData.orders = 'skip turn';
    } else if (orders == 'sleep') {
      unitData.orders = 'sleep';
    } else if (orders == 'wake') {
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
  if (unit.movesRemaining == 0) {
    console.log('invalid unit action');
    return res.redirect('/');
  }

  let unitData = {};
  let tileData = {};

  let tile = data.tiles.filter(tile => {
    return tile.row == unit.location[0] && tile.column == unit.location[1];
  })[0];

  let unitType = unit.unitType.name;
  let hasMoves = unit.movesRemaining > 0;
  let inForest = tile.terrain.forest;
  let inOwnTerritory = '' + tile.player == '' + data.turnPlayerId;
  let inRivalTerritory = tile.player && !inOwnTerritory;
  let inCity = data.cities.filter(city => city.location[0] == unit.location[0]
      && city.location[1] == unit.location[1]).length > 0;

  if (orders == 'buildFarm') {
    if (inForest || inCity || !inOwnTerritory || unitType != 'worker' || !hasMoves
        || tile.improvement != null) {
      console.log('Invalid unit action.');
      return res.redirect('/');
    }
    unitData.orders = 'build farm';

    if (tile.improvement != 'build farm') {
      tileData.improvement = 'build farm';
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

module.exports = router;
