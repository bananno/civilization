const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/workTile/:cityId/:tileId', (req, res, next) => {
  let cityId = req.params.cityId;
  let tileId = req.params.tileId;

  console.log('WORK TILE');
  console.log(cityId);
  console.log(tileId);

  getData(req, res, next, (data) => {

    res.redirect('/');

  });
});

module.exports = router;
