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

module.exports = router;
