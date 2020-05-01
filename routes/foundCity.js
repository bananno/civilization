const {
  express,
  City,
  Tile,
  Unit,
  getData,
} = require('./import');

const router = express.Router();

router.post('/foundCity/:unitId', (req, res, next) => {
  let unitId = req.params.unitId;
  getData(req, res, next, (data) => {
    const unit = data.unitRef[unitId];

    const errorMsg = getFoundCityError(data, unit);

    if (errorMsg) {
      const error = new Error(errorMsg);
      error.status = 412;
      return next(error);
    }

    foundCity(data, unit.player, unit.location, () => {
      res.redirect(302, '/');
    });

    deleteSettler(unit);
  });
});

function getFoundCityError(data, unit) {
  if (unit == null) {
    return 'Unit is null.';
  }

  if (unit.templateName != 'settler') {
    return 'This unit is not a settler.';
  }

  if (!data.help.isCurrentPlayer(unit.player)) {
    return 'Current player does not own this unit.';
  }

  if (unit.movesRemaining == 0) {
    return 'Unit has no moves left.';
  }

  const tile = data.tileRef[unit.location[0]][unit.location[1]];

  if (tile.player) {
    if (!data.help.isCurrentPlayer(tile.player)) {
      return 'Cannot found a city in another player\'s territory.';
    }

    if (tile.improvement == 'city') {
      return 'Cannot found a city in an existing city tile.';
    }
  }

  if (tile.terrain.water) {
    return 'Cannot found a city in a water tile.';
  }

  if (tile.terrain.mountain) {
    return 'Cannot found a city in a mountain tile.';
  }

  return null;
}

async function foundCity(data, player, location, next) {
  const city = await createCity(data, player, location);
  const tile = data.tileRef[location[0]][location[1]];

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
  const borderTiles = await claimBorderTiles(data, location, player, checkDuplicate);

  // Discover nearby tiles.
  borderTiles.forEach(tile => {
    data.help.forEachAdjacentTile(tile.location, tile => {
      if (!checkDuplicate(tile.location)) {
        asyncUpdateTile(tile, {
          discovered: tile.discovered.concat(player),
        });
      }
    });
  });

  workTile.auto(data, city, borderTiles);

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
      culture: 0,
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

async function claimBorderTiles(data, location, player, checkDuplicate) {
  const borderTiles = [];
  return await new Promise(resolve => {
    data.help.forEachAdjacentTile(location, tile => {
      borderTiles.push(tile);
      checkDuplicate(tile.location);
      asyncUpdateTile(tile, {
        player: player,
      });
    });
    resolve(borderTiles);
  });
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

  await asyncUpdateTile(tile, tileUpdate);
}

async function deleteSettler(unit) {
  await Unit.deleteOne(unit, () => {});
}

async function asyncUpdateTile(tile, tileData) {
  await Tile.update(tile, tileData, () => { });
}

module.exports = router;
