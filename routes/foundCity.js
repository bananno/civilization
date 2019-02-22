const express = require('express');
const router = express.Router();
const getData = require('./getData');
const Unit = require('../models/unit');
const City = require('../models/city');

router.post('/foundCity/:unitId', (req, res, next) => {
  let unitId = req.params.unitId;
  getData(req, res, next, (data) => {
    const unit = data.unitRef[unitId];

    if (unit == null || unit.templateName != 'settler' || unit.movesRemaining == 0
        || '' + unit.player != '' + data.turnPlayerId) {
      console.log('invalid unit action');
      return res.redirect('/');
    }

    const tile = data.tileRef[unit.location[0]][unit.location[1]];

    if (tile.player && !data.help.isCurrentPlayer(tile.player)) {
      console.log('Cannot build a city in another player\'s territory.');
      return res.redirect('/');
    }

    foundCity(data, unit.player, unit.location, tile, () => {
      res.redirect('/');
    });

    deleteSettler(unit);
  });
});

async function foundCity(data, player, location, tile, next) {
  const city = await createCity(data, player, location);

  // Prevent city and border tiles from begin revisited in the "nearby" tiles section.
  const tileAlreadyCovered = {};
  const checkDuplicate = (location) => {
    if (tileAlreadyCovered[location.join(',')]) {
      return true;
    }
    tileAlreadyCovered[location.join(',')] = true;
  };

  // Update the tile which now contains the city.
  updateCityTile(tile, city);
  checkDuplicate(tile.location);

  // Claim border tiles if they are available.
  const borderTiles = [];
  data.help.forEachAdjacentTile(location, tile => {
    borderTiles.push(tile);
    checkDuplicate(tile.location);
    asyncUpdate(tile, {
      player: player,
    });
  });

  // Discover nearby tiles.
  borderTiles.forEach(tile => {
    data.help.forEachAdjacentTile(tile.location, tile => {
      if (!checkDuplicate(tile.location)) {
        asyncUpdate(tile, {
          discovered: tile.discovered.concat(player),
        });
      }
    });
  });

  next();
}

async function createCity(data, player, location) {
  const cityData = {
    game: data.game,
    player: player,
    location: location,
    buildings: [],
    project: {
      category: null,
      index: null,
    },
    projectProgress: {
      unit: [],
      building: [],
    },
    storage: {
      food: 0,
      labor: 0,
    },
  };

  if (playerHasNoCitiesYet(data, player)) {
    cityData.buildings.push(0);
  }

  return await new Promise((resolve, reject) => {
    City.create(cityData, (error, city) => {
      resolve(city);
    });
  });
}

function playerHasNoCitiesYet(data, player) {
  const playerCities = data.cities.filter(city => {
    return city.player == player;
  });

  return playerCities.length == 0;
}

async function updateCityTile(tile, city) {
  let tileUpdate = {
    improvement: 'city',
    worked: city,
    road: true,
    player: city.player,
  };

  if (tile.terrain.forest) {
    tileUpdate.terrain = tile.terrain;
    tileUpdate.terrain.forest = false;
  }

  await tile.update(tileUpdate);
}

async function deleteSettler(unit) {
  await Unit.deleteOne(unit);
}

async function asyncUpdate(obj, data) {
  await obj.update(data);
}

module.exports = router;
