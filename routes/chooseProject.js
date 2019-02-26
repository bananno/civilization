const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/automateProjects/:cityId', (req, res, next) => {
  let cityId = req.params.cityId;

  getData(req, res, next, (data) => {
    const city = data.cityRef[cityId];

    if (city == null || !data.help.isCurrentPlayer(city.player)) {
      console.log('Invalid city action.');
      return res.send(false);
    }

    const cityData = {
      projectAutomate: !city.projectAutomate,
    };

    city.update(cityData, error => {
      if (error) {
        return res.send(false);
      }
      res.send(true);
    });
  });
});

router.get('/chooseProject/:cityId/:project/:index', (req, res, next) => {
  const cityId = req.params.cityId;
  const project = req.params.project;
  const index = req.params.index;

  getData(req, res, next, (data) => {
    const city = data.cityRef[cityId];

    if (city == null || !data.help.isCurrentPlayer(city.player)) {
      console.log('Invalid city action.');
      return res.redirect('/');
    }

    let projectTemplate = null;

    if (project == 'building') {
      projectTemplate = data.buildingList[index];
    } else if (project == 'unit') {
      projectTemplate = data.unitList[index];
    }

    if (projectTemplate) {
      if (!projectTemplate.isAvailable) {
        console.log('Required technology is not yet discovered for this project.');
        return res.redirect('/');
      }

      if (city.population == 1 && projectTemplate.name == 'settler') {
        console.log('Cannot train settlers in city with population of 1.');
        return res.redirect('/');
      }

      if (!city.isCoastal && projectTemplate.name == 'galley') {
        console.log('This project requires a coastal city.');
        return res.redirect('/');
      }
    }

    const cityData = {
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
