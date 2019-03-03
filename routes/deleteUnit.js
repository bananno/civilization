const express = require('express');
const router = express.Router();
const Unit = require('../models/unit');
const getData = require('./getData');

router.post('/deleteUnit/:unitId', (req, res, next) => {
  const unitId = req.params.unitId;

  Unit.findById(unitId, (error, unit) => {
    if (error) {
      return next(error);
    }

    if (unit.movesRemaining < 1) {
      return res.json(null);
    }

    Unit.findByIdAndRemove(unitId, (error, res2) => {
      if (error) {
        return next(error);
      }
      return res.json(res2);
    });
  });
});

module.exports = router;
