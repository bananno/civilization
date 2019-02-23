const express = require('express');
const router = express.Router();
const getData = require('../getData');
const createUnit = require('../createUnit');

const updateUnits = require('./updateUnits');

const cityGrowthRate = [0, 15, 22, 30, 40, 51, 63, 76, 90, 105, 121, 138, 155, 174, 194, 214,
  235, 258, 280, 304, 329, 354, 380, 407, 435, 464, 493, 523, 554, 585, 617, 650, 684, 719, 754,
  790, 826, 863, 901, 940, 979];

router.post('/endTurn', (req, res, next) => {
  const done = () => {
    res.redirect('/');
  };

  getData(req, res, next, (data) => {
    endTurn(data, done);
  });
});

async function endTurn(data, done) {
  if (!allCitiesHaveProject(data.currentPlayer, data.cities)) {
    console.log('All cities must have a project to end turn.');
    return done();
  }

  if (playerNeedsResearch(data.currentPlayer, data.technologyList)) {
    console.log('Player must choose research before ending turn.');
    return done();
  }

  await updateGame(data);
  await updateUnits(data);
  await updateCities(data);
  await updatePlayer(data);

  done();
}

function updateGame(data) {
  const gameData = {};

  if (data.game.nextPlayer < data.players.length - 1) {
    gameData.nextPlayer = data.game.nextPlayer + 1;
  } else {
    gameData.nextPlayer = 0;
    gameData.turn = data.game.turn + 1;
  }

  data.game.update(gameData);
}

async function updateCities(data) {
  data.cities.forEach(city => {
    if (!data.help.isCurrentPlayer(city.player)) {
      return;
    }

    const cityData = {};

    const completeUpdate = () => {
      city.update(cityData);
    };

    cityData.storage = city.storage;

    const projectCategory = city.project.category;
    const projectIndex = city.project.index;

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
          templateIndex: projectIndex,
        };
        return createUnit(unitData, completeUpdate);
      }
    }

    completeUpdate();
  });
}

async function updatePlayer(data) {
  const player = data.currentPlayer
  const playerData = {};

  const completeUpdate = () => {
    player.update(playerData);
  };

  playerData.storage = player.storage;
  playerData.researchProgress = player.researchProgress;

  // gold & culture go directly into storage for spending during turn
  playerData.storage.gold += player.production.gold;
  playerData.storage.culture += player.production.culture;

  // research progress is applied to the current technology
  if (player.researchCurrent == null) {
    playerData.storage.science += player.production.science;
    return completeUpdate();
  }

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

  completeUpdate();
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
