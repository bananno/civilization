const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.get('/chooseResearch/:index', (req, res, next) => {
  getData(req, res, next, (data) => {
    let index = parseInt(req.params.index);
    let player = data.playerRef[data.turnPlayerId];
    let technology = data.technologyList[index];

    if (!technology.isAvailable) {
      console.log('Technology is not available.');
      return res.redirect('/');
    }

    let playerData = {
      researchCurrent: index,
    };

    player.update(playerData, error => {
      if (error) {
        return next(error);
      }
      res.redirect('/');
    });
  });
});

module.exports = router;
