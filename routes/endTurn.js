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
        next(error);
      } else if (endOfRound) {
        endRound(res, data);
      } else {
        res.redirect('/');
      }
    });
  });
});

function endRound(res, data) {
  // reset moves for all units
  const updateUnit = (i) => {
    if (i >= data.units.length) {
      return goToNext();
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
      return goToNext();
    }
    let cityData = {};

    let category = data.cities[i].project.category;
    let index = data.cities[i].project.index;
    let productionPerTurn = calculateCityProduction(data.cities[i], data.buildingTypes);

    cityData.projectProgress = data.cities[i].projectProgress;
    cityData.projectProgress[category][index] += productionPerTurn;

    let productionSoFar = cityData.projectProgress[category][index];
    let productionNeeded = 0;

    if (category == 'unit') {
      productionNeeded = data.unitTypes[index].cost;
    } else if (category == 'building') {
      productionNeeded = data.buildingTypes[index].cost;
    }

    if (productionSoFar >= productionNeeded && category == 'building') {
      cityData.productionRollover = productionSoFar - productionNeeded;
      cityData.projectProgress[category][index] = 0;
      cityData.buildings = data.cities[i].buildings;
      cityData.buildings.push(index);
      cityData.project = {
        category: null,
        index: null,
      };
    }

    data.cities[i].update(cityData, (error, city) => {
      updateCity(i + 1);
    });
  }

  // increment gold for all players
  const updatePlayer = (i) => {
    if (i >= data.players.length) {
      return goToNext();
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

  const functionList = [updateUnit, updateCity, updatePlayer];
  let count = 0;

  const goToNext = () => {
    if (count < functionList.length) {
      functionList[count](0);
      count += 1;
    } else {
      res.redirect('/');
    }
  };

  goToNext();
}

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

function calculateCityProduction(city, buildingTypes) {
  let production = 0;

  city.buildings.forEach(i => {
    production += buildingTypes[i].production;
  });

  return production;
}

module.exports = router;
