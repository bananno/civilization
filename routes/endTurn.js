const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/endTurn', (req, res, next) => {
  getData(req, res, next, (data) => {
    let gameData = {};
    let endOfRound = false;
    if (data.game.nextPlayer < data.players.length - 1) {
      gameData.nextPlayer = data.game.nextPlayer + 1;
    } else {
      gameData.nextPlayer = 0;
      gameData.turn = data.game.turn + 1;
      endOfRound = true;
    }
    data.game.update(gameData, (error, game) => {
      if (error) {
        return next(error);
      }
      if (endOfRound) {
        const updateUnit = (i) => {
          if (i >= data.units.length) {
            return updatePlayer(0);
          }
          let unitData = {
            movesRemaining: data.units[i].moves,
          };
          data.units[i].update(unitData, (error, unit) => {
            updateUnit(i + 1);
          });
        };

        const updatePlayer = (i) => {
          if (i >= data.players.length) {
            return res.redirect('/');
          }
          let currentGold = data.players[i].gold;
          let goldPerTurn = data.goldPerTurn[data.players[i]._id];
          let playerData = {
            gold: currentGold + goldPerTurn
          };
          data.players[i].update(playerData, (error, player) => {
            updatePlayer(i + 1);
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
