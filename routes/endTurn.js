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
        const updateUnit = (i) => {
          if (i >= data.units.length) {
            return res.redirect('/');
          }
          let unitData = {
            movesRemaining: data.units[i].moves,
          };
          data.units[i].update(unitData, (error, unit) => {
            updateUnit(i + 1);
          });
        };
        updateUnit(0);
      } else {
        res.redirect('/');
      }
    })
  });
});

module.exports = router;
