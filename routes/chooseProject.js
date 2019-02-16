const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.get('/chooseProject/:cityId/:project/:index', (req, res, next) => {
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

    let projectTemplate = null;

    if (project == 'building') {
      projectTemplate = data.buildingList[index];
    } else if (project == 'unit') {
      projectTemplate = data.unitList[index];
    }

    if (!projectTemplate.isAvailable) {
      console.log('Required technology is not yet discovered for this project.');
      return res.redirect('/');
    }

    if (city.population == 1 && projectTemplate.name == 'settler') {
      console.log('Cannot train settlers in city with population of 1.');
      return res.redirect('/');
    }

    let cityData = {
      project: {
        category: project,
        index: index,
      },
      projectProgress: city.projectProgress,
    };

    if (project == 'unit' || project == 'building') {
      cityData.projectProgress[project][index] = cityData.projectProgress[project][index] || 0;
    }

    city.update(cityData, (error, city) => {
      if (error) {
        return next(error);
      }
      res.redirect('/');
    });
  });
});

module.exports = router;
