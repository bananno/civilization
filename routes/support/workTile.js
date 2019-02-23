
// Automatically chooses a tile and then updates it.
function automaticallyChooseTileToWork(data, city) {
  const unemployedCitizens = data.help.numCityUnemployedCitizens(city);

  if (unemployedCitizens <= 0) {
    return;
  }

  const tileOptions = data.help.getCityWorkableTiles(city);

  let maxProductionFound = 0;
  let selectedTile;

  tileOptions.forEach(tile => {
    if (tile.worked) {
      return;
    }

    let production = data.help.getTileTotalProduction(tile);

    if (production > maxProductionFound) {
      maxProductionFound = production;
      selectedTile = tile;
    }
  });

  if (selectedTile) {
    updateAGivenTileToAGivenCity(city, selectedTile);
  }
}

// Updates a given tile to be worked by a given city.
async function updateAGivenTileToAGivenCity(city, tile) {
  await tile.update({
    worked: city,
  });
}

module.exports = {
  auto: automaticallyChooseTileToWork,
  update: updateAGivenTileToAGivenCity,
};
