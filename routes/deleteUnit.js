const express = require('express');
const router = express.Router();
const Unit = require('../models/unit');

router.get('/units', (req, res, next) => {
  Unit.find({}, function (err, units) {
    if (err) return next(err);
    res.json(units);
  });
});

router.post('/deleteUnit/:unitId', (req, res, next) => {
  return res.redirect('/');
});

module.exports = router;
