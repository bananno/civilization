const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.get('/chooseResearch/:index', (req, res, next) => {
  getData(req, res, next, (data) => {
    let index = req.params.index;
    const playerData = {};

    if (index == 'automate') {
      playerData.researchAutomate = !data.currentPlayer.researchAutomate;
      index = chooseNextAutoTechnology(data);
    } else {
      index = parseInt(req.params.index);
      const technology = data.technologyList[index];

      if (!technology.isAvailable) {
        console.log('Technology is not available.');
        return res.redirect('/');
      }
    }

    if (index != null) {
      playerData.researchCurrent = index;
      playerData.researchProgress = data.currentPlayer.researchProgress;
      playerData.researchProgress[index] = playerData.researchProgress[index] || 0;
    }

    data.currentPlayer.update(playerData, error => {
      if (error) {
        return next(error);
      }
      res.redirect('/');
    });
  });
});

function chooseNextAutoTechnology(data) {
  const availableTechs = data.technologyList.filter(tech => tech.isAvailable);

  if (availableTechs.length == 0) {
    return null;
  }

  return availableTechs[0].index;
}

module.exports = router;
