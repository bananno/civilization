const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.get('/changeProject/:cityId/:project/:index', (req, res, next) => {
  let cityId = req.params.cityId;
  let project = req.params.project;
  let index = req.params.index;

  getData(req, res, next, (data) => {
    let turnPlayerId = data.players[data.game.nextPlayer]._id;

    let city = data.cities.filter(city => {
      return city._id == cityId && '' + city.player == '' + turnPlayerId;
    })[0];

    if (city == null) {
      console.log('Invalid city action.');
      return res.redirect('/');
    }

    let cityData = {
      project: {
        category: project,
        index: index,
      },
      projectProgress: city.projectProgress,
    };

    cityData.projectProgress[project][index] = cityData.projectProgress[project][index] || 0;

    city.update(cityData, (error, city) => {
      if (error) {
        return next(error);
      }
      res.redirect('/');
    });
  });
});

module.exports = router;
