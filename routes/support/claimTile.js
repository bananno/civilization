
function automaticallyChooseTile(data, city) {
  let maxValueFound = 0;
  let selectedTile;

  data.help.getCityClaimableTiles(city).forEach(tile => {
    let tileValue = data.help.getTileTotalProduction(tile);

    if (false) {
      // later, increment tile value based on natural resources
    }

    if (tileValue > maxValueFound) {
      maxValueFound = tileValue;
      selectedTile = tile;
    }
  });

  if (selectedTile) {
    console.log('CLAIM TILE');
    console.log(selectedTile.location);
    claimGivenTile(data, selectedTile);
  }
}

async function claimGivenTile(data, tile) {
  await tile.update({
    player: data.currentPlayer,
  });
}

module.exports = {
  auto: automaticallyChooseTile,
  claim: claimGivenTile,
};
