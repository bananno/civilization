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

    let turnPlayerId = data.players[data.game.nextPlayer]._id;

    if ('' + unit.player != '' + turnPlayerId) {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    let unitData = {};

    if (orders == 'skipTurn') {
      unitData.orders = 'skip turn';
    } else if (orders == 'sleep') {
      unitData.orders = 'sleep';
    } else if (orders == 'buildFarm') {
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
  let tile = data.tiles.filter(tile => {
    return tile.row == unit.location[0] && tile.column == unit.location[1];
  })[0];

  let turnPlayerId = data.players[data.game.nextPlayer]._id;

  if (unit.unitType.name != 'worker' || unit.movesRemaining == 0
      || '' + tile.owner != '' + turnPlayerId
      || '' + unit.player != '' + turnPlayerId) {
    console.log('invalid unit action');
    return res.redirect('/');
  }

  let unitData = {
    orders: 'build farm',
  };

  let tileData = {};

  if (tile.improvement != 'build farm') {
    tileData.improvement = 'build farm';
    tileData.progress = 0;
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
