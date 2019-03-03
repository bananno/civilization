const express = require('express');
const router = express.Router();
const Unit = require('../models/unit');
const getData = require('./getData');

router.post('/deleteUnit/:unitId', (req, res, next) => {
  const unitId = req.params.unitId;

  getData(req, res, next, (data) => {
    const unit = data.unitRef[unitId];

    if (unit.movesRemaining < 1) {
      error = new Error('Cannot delete a unit that has no moves left.');
      error.status = 412;
      return next(error);
    }

    if (!data.help.isCurrentPlayer(unit.player)) {
      error = new Error('Current player does not own this unit.');
      error.status = 412;
      return next(error);
    }

    Unit.deleteOne(unit, (error, res2) => {
      if (error) {
        return next(error);
      }
      return res.json(res2);
    });
  });
});

module.exports = router;
