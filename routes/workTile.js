const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/workTile/:cityId/:row/:column', (req, res, next) => {
  let cityId = req.params.cityId;
  let row = parseInt(req.params.row);
  let column = parseInt(req.params.column);

  console.log('WORK TILE');
  console.log(cityId);
  console.log(row);
  console.log(column);

  getData(req, res, next, (data) => {

    res.redirect('/');

  });
});

module.exports = router;
