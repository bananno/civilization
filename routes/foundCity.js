const express = require('express');
const router = express.Router();
const getData = require('./getData');

const Unit = require('../models/unit');

router.post('/foundCity/:unitId', (req, res, next) => {
  let unitId = req.params.unitId;
  getData(req, res, next, (data) => {
    let unit = data.units.filter(unit => {
      return unit._id == unitId;
    })[0];

    if (unit.unitType.name != 'settler' || unit.movesRemaining == 0) {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    Unit.deleteOne(unit, error => {
      if (error) {
        return next(error);
      }
      return res.redirect('/');
    });
  });
});

module.exports = router;
