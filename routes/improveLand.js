const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/improveLand/:unitId/:improvement', (req, res, next) => {
  let unitId = req.params.unitId;
  let improvement = req.params.improvement;

  getData(req, res, next, (data) => {
    let numMapRows = data.game.mapSize[0];
    let numMapCols = data.game.mapSize[1];

    let unit = data.units.filter(unit => {
      return unit._id == unitId;
    })[0];

    let turnPlayerId = data.players[data.game.nextPlayer]._id;

    if (unit.unitType.name != 'worker' || unit.movesRemaining == 0
        || '' + unit.player != '' + turnPlayerId) {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    console.log('success');

    res.redirect('/');
  });
});

module.exports = router;
