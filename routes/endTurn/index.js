const {
  getData,
} = require('../import');

const updateUnits = require('./updateUnits');
const updateCities = require('./updateCities');
const updatePlayer = require('./updatePlayer');

module.exports = endTurnPost;

function endTurnPost(req, res, next) {
  getData(req, res, next, (data) => {
    if (!allCitiesHaveProject(data)) {
      console.log('All cities must have a project to end turn.');
      return res.redirect('/');
    }

    if (playerNeedsResearch(data)) {
      console.log('Player must choose research before ending turn.');
      return res.redirect('/');
    }

    endTurn(data);
    res.redirect('/');
  });
}

async function endTurn(data) {
  await updateGame(data);
  await updateUnits(data);
  await updateCities(data);
  await updatePlayer(data);
}

async function updateGame(data) {
  const gameData = {};

  if (data.game.nextPlayer < data.players.length - 1) {
    gameData.nextPlayer = data.game.nextPlayer + 1;
  } else {
    gameData.nextPlayer = 0;
    gameData.turn = data.game.turn + 1;
  }

  await data.game.update(gameData);
}

function allCitiesHaveProject(data) {
  for (let i = 0; i < data.cities.length; i++) {
    const city = data.cities[i];

    if (!data.help.isCurrentPlayer(city.player)) {
      continue;
    }

    if (!city.projectAutomate && (city.project == null || city.project.category == null
        || city.project.category == '')) {
      return false;
    }
  }
  return true;
}

function playerNeedsResearch(data) {
  return data.currentPlayer.researchCurrent == null
    && data.currentPlayer.production.science > 0
    && data.technologyList.filter(tech => tech.isAvailable).length > 0;
}
