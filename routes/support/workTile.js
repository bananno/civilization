
// Automatically chooses a tile and then updates it.
function automaticallyChooseTileToWork(city, tiles) {

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
