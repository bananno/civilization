const helpers = require('../helpers');

function chooseUnitLocations(tiles, numPlayers) {
  const numCols = tiles[0].length;
  const locations = [];

  const passableTiles = tiles.filter((tile, i) => {
    if (tile.terrain.water || tile.terrain.mountain) {
      return false;
    }
    const nextTile = tiles[i + 1];
    if (nextTile == null || nextTile.terrain.water || nextTile.terrain.mountain) {
      return false;
    }
    return true;
  });

  for (let i = 0; i < numPlayers; i++) {
    while (true) {
      let tileNum = helpers.getRandomInt(0, passableTiles.length - 1);
      let [r1, c1] = passableTiles[tileNum].location;
      let [r2, c2] = [r1, helpers.getColumn(numCols, c1 + 1)];

      const otherPlayersNearby = locations.filter(pair => {
        let [r3, c3] = pair[0];
        return Math.abs(r1 - r3) < 6 && Math.abs(c1 - c3) < 6;
      });

      if (otherPlayersNearby.length > 0) {
        continue;
      }

      locations.push([[r1, c1], [r1, c2]]);
      break;
    }
  }

  return locations;
}

module.exports = chooseUnitLocations;
