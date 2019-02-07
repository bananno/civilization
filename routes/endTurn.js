const express = require('express');
const router = express.Router();
const getData = require('./getData');
const createUnit = require('./createUnit');

const cityGrowthRate = [0, 15, 22, 30, 40, 51, 63, 76, 90, 105, 121, 138, 155, 174, 194, 214,
  235, 258, 280, 304, 329, 354, 380, 407, 435, 464, 493, 523, 554, 585, 617, 650, 684, 719, 754,
  790, 826, 863, 901, 940, 979];

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

  // increment project & growth progress for all cities
  const updateCity = (i) => {
    if (i >= data.cities.length) {
      return goToNext();
    }

    let city = data.cities[i];
    let cityData = {};

    const completeUpdate = () => {
      city.update(cityData, error => {
        if (error) {
          return next(error);
        }
        updateCity(i + 1);
      });
    };

    let projectCategory = city.project.category;
    let projectIndex = city.project.index;
    let productionPerTurn = calculateCityProduction(city, data.buildingTypes);

    let productionSoFar = 0;
    let productionNeeded = 0;
    let projectIsComplete = false;
    let allowGrowth = true;

    if (projectCategory == 'unit' || projectCategory == 'building') {
      cityData.projectProgress = city.projectProgress;
      cityData.projectProgress[projectCategory][index] += productionPerTurn;
      cityData.projectProgress[projectCategory][index] += city.productionRollover;

      cityData.productionRollover = 0;

      productionSoFar = cityData.projectProgress[projectCategory][index];

      if (projectCategory == 'unit') {
        productionNeeded = data.unitTypes[index].cost;
        if (data.unitTypes[index].name == 'settler') {
          allowGrowth = false;
        }
      } else if (projectCategory == 'building') {
        productionNeeded = data.buildingTypes[index].cost;
      }

      projectIsComplete = productionSoFar >= productionNeeded;
    }

    let foodPerTurn = calculateCityFood(city, data.buildingTypes);
    let foodEatenPerTurn = city.population * 2;
    let foodSurplus = foodPerTurn - foodEatenPerTurn;

    if (!allowGrowth && foodSurplus > 0) {
      foodSurplus = 0;
    }

    cityData.food = city.food + foodSurplus;

    if (cityData.food >= cityGrowthRate[city.population] && foodSurplus >= 2) {
      cityData.population = city.population + 1;
      cityData.food -= cityGrowthRate[city.population];
    }

    if (projectIsComplete) {
      cityData.productionRollover = productionSoFar - productionNeeded;
      cityData.projectProgress[projectCategory][index] = 0;
      cityData.project = {
        category: null,
        index: null,
      };

      if (projectCategory == 'building') {
        cityData.buildings = data.cities[i].buildings;
        cityData.buildings.push(index);
      } else if (projectCategory == 'unit') {
        let unitData = {
          game: city.game,
          player: city.player,
          location: city.location.concat(),
          unitTypeIndex: index,
        };
        return createUnit(unitData, completeUpdate);
      }
    }

    completeUpdate();
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

function calculateCityFood(city, buildingTypes) {
  let food = 0;

  city.buildings.forEach(i => {
    food += buildingTypes[i].food;
  });

  return food;
}

module.exports = router;
