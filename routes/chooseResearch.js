const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.get('/chooseResearch/:index', (req, res, next) => {
  getData(req, res, next, (data) => {
    let index = parseInt(req.params.index);
    let player = data.playerRef[data.turnPlayerId];

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
