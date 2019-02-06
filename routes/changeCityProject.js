const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.get('/changeProject/:cityId/:project/:index', (req, res, next) => {
  let cityId = req.params.cityId;
  let project = req.params.project;
  let index = req.params.index;

  console.log(cityId);
  console.log(project);
  console.log(index);

  getData(req, res, next, (data) => {
    res.redirect('/');
  });
});

module.exports = router;
