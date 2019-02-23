const express = require('express');
const router = express.Router();
const getData = require('../getData');
const createUnit = require('../createUnit');

const updateUnits = require('./updateUnits');
const updateCities = require('./updateCities');
const updatePlayer = require('./updatePlayer');

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
