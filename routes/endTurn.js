const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/endTurn', (req, res, next) => {
  getData(req, res, next, (data) => {
    let gameData = {};
    let endOfRound = false;

    if (!allCitiesHaveProject(data.players[data.game.nextPlayer], data.cities)) {
      console.log('All cities must have a project to end turn.');
      return res.redirect('/');
    }

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

      if (!endOfRound) {
        return res.redirect('/');
      }

      // reset moves for all units
      const updateUnit = (i) => {
        if (i >= data.units.length) {
          return updateCity(0);
        }
        let unitData = {
          movesRemaining: data.units[i].moves,
        };
        data.units[i].update(unitData, (error, unit) => {
          updateUnit(i + 1);
        });
      };

      // increment project progress for all cities
      const updateCity = (i) => {
        if (i >= data.cities.length) {
          return updatePlayer(0);
        }
        let cityData = {};
        data.cities[i].update(cityData, (error, city) => {
          updateCity(i + 1);
        });
      }

      // increment gold for all players
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
    })
  });
});

function allCitiesHaveProject(player, cities) {
  for (let i = 0; i < cities.length; i++) {
    if ('' + cities[i].player != '' + player._id) {
      continue;
    }
    if (cities[i].project == null || cities[i].project.category == null
        || cities[i].project.category == '') {
      return false;
    }
  }
  return true;
}

module.exports = router;
