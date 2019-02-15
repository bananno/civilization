const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.get('/chooseResearch/:index', (req, res, next) => {
  getData(req, res, next, (data) => {
    const index = parseInt(req.params.index);
    const technology = data.technologyList[index];

    if (!technology.isAvailable) {
      console.log('Technology is not available.');
      return res.redirect('/');
    }

    const playerData = {};

    playerData.researchCurrent = index;
    playerData.researchProgress = data.currentPlayer.researchProgress;
    playerData.researchProgress[index] = playerData.researchProgress[index] || 0;

    data.currentPlayer.update(playerData, error => {
      if (error) {
        return next(error);
      }
      res.redirect('/');
    });
  });
});

module.exports = router;
