const express = require('express');
const router = express.Router();
const getData = require('./getData');
const helpers = require('./helpers');
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

    if (playerNeedsResearch(data.players[data.game.nextPlayer], data.technologyList)) {
      console.log('Player must choose research before ending turn.');
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
  // reset moves & skips for all units
  const updateUnit = (i) => {
    if (i >= data.units.length) {
      return goToNext();
    }

    let unit = data.units[i];
    let tile = helpers.findTile(data.tiles, unit.location);
    let unitData = {};
    let tileData = {};

    const completeUpdate = () => {
      unit.update(unitData, (error, unit) => {
        if (error) {
          return next(error);
        }
        updateUnit(i + 1);
      });
    };

    unitData.movesRemaining = unit.moves;

    let orders = unit.orders;

    if (orders == null) {
      if (unit.automate && unit.unitType.name == 'worker') {
        if (tile.improvement == null) {
          if (tile.terrain.forest) {
            orders = 'chop forest';
            tileData.project = 'chop forest';
          } else if (tile.terrain.hill) {
            orders = 'build mine';
            tileData.project = 'build mine';
          } else {
            orders = 'build farm';
            tileData.project = 'build farm';
          }
        }
      } else {
        return completeUpdate();
      }
    }

    if (orders == 'skip turn') {
      unitData.orders = null;
      completeUpdate();
    } else if (orders.match('build') || orders.match('remove')
        || orders == 'chop forest') {
      let tile = helpers.findTile(data.tiles, unit.location);
      let tileData = {};

      let projectDone = false;

      if (orders == 'build farm' || orders == 'build mine'
          || orders == 'chop forest') {
        tileData.progress = tile.progress + unit.movesRemaining;
      } else if (orders == 'build road') {
        tileData.roadProgress = tile.roadProgress + unit.movesRemaining;
      }

      if (orders == 'build farm' && tileData.progress >= 10) {
        projectDone = true;
        tileData.improvement = 'farm';
        tileData.production = tile.production;
        tileData.production.food += 1;
        unitData.orders = null;
      } else if (orders == 'build mine' && tileData.progress >= 12) {
        projectDone = true;
        tileData.improvement = 'mine';
        tileData.production = tile.production;
        tileData.production.labor += 1;
        unitData.orders = null;
      } else if (orders == 'chop forest' && tileData.progress >= 5) {
        projectDone = true;
        tileData.terrain = tile.terrain;
        tileData.terrain.forest = false;
      } else if (orders == 'remove farm' && unit.movesRemaining > 0) {
        projectDone = true;
        tileData.improvement = null;
        tileData.production = tile.production;
        tileData.production.food -= 1;
      } else if (orders == 'remove mine' && unit.movesRemaining > 0) {
        projectDone = true;
        tileData.improvement = null;
        tileData.production = tile.production;
        tileData.production.labor -= 1;
      } else if (orders == 'build road' && tileData.roadProgress >= 5) {
        tileData.road = true;
        unitData.orders = null;
      }

      if (projectDone) {
        unitData.orders = null;
        tileData.project = null;
        tileData.progress = 0;
      }

      tile.update(tileData, (error, tile) => {
        if (error) {
          return next(error);
        }
        completeUpdate();
      });
    } else {
      completeUpdate();
    }
  };

  // increment project & growth progress for all cities
  const updateCity = (i) => {
    if (i >= data.cities.length) {
      return goToNext();
    }

    let city = data.cities[i];
    let cityData = {};
    cityData.storage = city.storage;

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

    let laborSoFar = 0;
    let laborNeeded = 0;
    let projectIsComplete = false;
    let allowGrowth = true;

    if (projectCategory == 'unit' || projectCategory == 'building') {
      cityData.projectProgress = city.projectProgress;
      cityData.projectProgress[projectCategory][projectIndex] += city.production.labor;
      cityData.projectProgress[projectCategory][projectIndex] += city.storage.labor;

      cityData.storage.labor = 0;

      laborSoFar = cityData.projectProgress[projectCategory][projectIndex];

      if (projectCategory == 'unit') {
        laborNeeded = data.unitList[projectIndex].laborCost;
        if (data.unitList[projectIndex].name == 'settler') {
          allowGrowth = false;
        }
      } else if (projectCategory == 'building') {
        laborNeeded = data.buildingList[projectIndex].laborCost;
      }

      projectIsComplete = laborSoFar >= laborNeeded;
    }

    let foodEatenPerTurn = city.population * 2;
    let foodSurplus = city.production.food - foodEatenPerTurn;

    if (!allowGrowth && foodSurplus > 0) {
      foodSurplus = 0;
    }

    cityData.storage.food += foodSurplus;

    if (cityData.storage.food >= cityGrowthRate[city.population] && foodSurplus >= 2) {
      cityData.population = city.population + 1;
      cityData.storage.food -= cityGrowthRate[city.population];
    }

    if (projectIsComplete) {
      cityData.storage.labor = laborSoFar - laborNeeded;
      cityData.projectProgress[projectCategory][projectIndex] = 0;
      cityData.project = {
        category: null,
        index: null,
      };

      if (projectCategory == 'building') {
        cityData.buildings = data.cities[i].buildings;
        cityData.buildings.push(projectIndex);
      } else if (projectCategory == 'unit') {
        let unitData = {
          game: city.game,
          player: city.player,
          location: city.location.concat(),
          unitTypeIndex: projectIndex,
        };
        return createUnit(unitData, completeUpdate);
      }
    }

    completeUpdate();
  }

  // increment production for all players
  const updatePlayer = (i) => {
    if (i >= data.players.length) {
      return goToNext();
    }
    const player = data.players[i];
    const playerData = {};

    playerData.storage = player.storage;
    playerData.researchProgress = player.researchProgress;

    // gold & culture go directly into storage for spending during turn
    playerData.storage.gold += player.production.gold;
    playerData.storage.culture += player.production.culture;

    // research progress is applied to the current technology
    if (player.researchCurrent != null) {
      const scienceCost = data.technologyList[player.researchCurrent].scienceCost;
      let researchProgress = 0;

      researchProgress += playerData.researchProgress[player.researchCurrent];
      researchProgress += player.production.science;
      researchProgress += player.storage.science;

      if (researchProgress >= scienceCost) {
        playerData.storage.science = researchProgress - scienceCost;
        playerData.technologies = player.technologies;
        playerData.technologies.push(player.researchCurrent);
        playerData.researchCurrent = null;
      } else {
        playerData.storage.science = 0;
        playerData.researchProgress[player.researchCurrent] = researchProgress;
      }
    } else {
      playerData.storage.science += player.production.science;
    }

    player.update(playerData, error => {
      updatePlayer(i + 1);
    });
  };

  const functionList = [updateUnit, updateCity, updatePlayer];
  let count = -1;

  const goToNext = () => {
    if (count < functionList.length - 1) {
      count += 1;
      functionList[count](0);
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

function playerNeedsResearch(player, technologyList) {
  return player.researchCurrent == null
    && player.production.science > 0
    && technologyList.filter(tech => tech.isAvailable).length > 0;
}

module.exports = router;
