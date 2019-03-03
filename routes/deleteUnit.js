const express = require('express');
const router = express.Router();
const Unit = require('../models/unit');
const getData = require('./getData');

router.post('/deleteUnit/:unitId', (req, res, next) => {
  const unitId = req.params.unitId;

  Unit.findById(unitId, (error, unit) => {
    Unit.findByIdAndRemove(unitId, (error, res2) => {
      if (error) {
        return next(error);
      }

      return res.json(res2);
    });
  });
});

module.exports = router;
