const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/endTurn', (req, res, next) => {
  getData(req, res, next, (data) => {
    let gameData = {};
    let resetMoves = false;
    if (data.game.nextPlayer < data.players.length - 1) {
      gameData.nextPlayer = data.game.nextPlayer + 1;
    } else {
      gameData.nextPlayer = 0;
      gameData.turn = data.game.turn + 1;
      resetMoves = true;
    }
    data.game.update(gameData, (error, game) => {
      if (error) {
        return next(error);
      }
      if (resetMoves) {
        // refactor later
        let tempUpdate = (i) => {
          if (i >= data.units.length) {
            return res.redirect('/');
          }
          data.units[i].update({ movesRemaining: 1 }, (error, unit) => {
            tempUpdate(i + 1);
          });
        };
        tempUpdate(0);
      } else {
        res.redirect('/');
      }
    })
  });
});

module.exports = router;
