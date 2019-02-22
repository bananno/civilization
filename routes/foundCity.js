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

  determineTileUpdates(data, city, tile, (tileList) => {
    finishTileUpdates(tileList, next);
  });
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
      resolve(city)
    });
  });
}

function playerHasNoCitiesYet(data, player) {
  const playerCities = data.cities.filter(city => {
    return city.player == player;
  });

  return playerCities.length == 0;
}

function getCityTileUpdate(tile, city) {
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

  return tileUpdate;
}

function determineTileUpdates(data, city, cityTile, next) {
  const tilesToUpdate = [];
  const tileAlreadyCovered = {};

  const addTile = (tile, tileData) => {
    const [r, c] = tile.location;

    if (tileAlreadyCovered[r + ',' + c]) {
      return;
    }

    tileAlreadyCovered[r + ',' + c] = true;

    tileData.discovered = tile.discovered;
    tileData.discovered.push(city.player);

    tilesToUpdate.push({
      tile: tile,
      update: tileData,
    });
  };

  // UPDATE THE TILE WHERE THE CITY IS BUILT.
  // The city tile itself is automatically worked by the city.
  // Remove any terrain features (forest) automatically.
  // Automatically build a road in the city.

  addTile(cityTile, getCityTileUpdate(cityTile, city));

  // CLAIM THE 6 TILES AROUND THE CITY IF THEY ARE AVAILABLE.

  const cityBorderCoords = [];

  data.help.forEachAdjacentTile(city.location, (tile, r, c) => {
    if (tile.player) {
      return;
    }
    cityBorderCoords.push([r, c]);
    addTile(tile, { player: city.player });
  });

  // DISCOVER THE 12 TILES ADJACENT TO THE CITY BORDERS.

  cityBorderCoords.forEach(tileCoords => {
    data.help.forEachAdjacentTile(tileCoords, (tile, r, c) => {
      addTile(tile, {});
    });
  });

  return next(tilesToUpdate);
}

function finishTileUpdates(tileList, next, i) {
  i = i || 0;

  if (i >= tileList.length) {
    return next();
  }

  const tile = tileList[i].tile;
  const tileData = tileList[i].update;

  tile.update(tileData, error => {
    if (error) {
      return next(error);
    }
    finishTileUpdates(tileList, next, i + 1);
  });
}

async function deleteSettler(unit) {
  await Unit.deleteOne(unit);
}

module.exports = router;
