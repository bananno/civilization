
/*

VISIBILITY RULES

A unit can see up to 2 tiles away. For the purpose of visibility, diagonal tiles are considered
  adjacent (unlike movement, in which diagonal moves are a sum of 2 adjacent moves.) So the
  maximum visibility range is a 5x5 tile area.

All adjacent tiles are always visible, so the minimum visibility range is a 3x3 tile range.

Adjacent forests, hills, and mountains block visibility. Higher objects can be seen beyond lower
objects. The unit can see further when on a hill, and not as far when in a forest.

| | | | | |
| | | | | |
| | |1| | |
| | |2|3| |
| | |4|5|6|

Diagram:
  The unit is locationed at (1).
  The far corner (6) is visible if the adjacent corner (3) is see-through.
  The far edge (4) is visible if the adjacent edge (2) is see-through.
  The far in-between (5) is visible if either of the adjacent tiles (2 or 3) is see-through.

Terrain:
  Adjacent tiles are always visible.
  When the unit is in a forest, no far tiles are visible.
  When the adjacent tile is a mountain, the far tile is not visible.
  When the adjacent tile is a hill, the far tile is visible if it is a mountain.
  When the adjacent tile is a (flat) forest, the far tile is visible if the unit is on a hill, OR
    if the far tile is a hill or mountain.

*/

const helpers = require('./helpers');

const getVisibleTiles = (numRows, numCols, tiles, row, column) => {
  if (row.constructor == Array) {
    [row, column] = row;
  }

  let visible = [];
  let tileGroup = [];

  for (let r1 = -2; r1 <= 2; r1++) {
    let r = row + r1;
    visible[r1] = [];
    tileGroup[r1] = [];

    for (let c1 = -2; c1 <= 2; c1++) {
      let c = helpers.getColumn(numCols, column + c1);

      tileGroup[r1][c1] = {
        mountain: false,
        hill: false,
        forest: false,
      };

      let tile = helpers.findTile(tiles, r, c);

      if (tile) {
        tileGroup[r1][c1].mountain = tile.terrain.mountain;
        tileGroup[r1][c1].hill = tile.terrain.hill;
        tileGroup[r1][c1].forest = tile.terrain.forest;
      }
    }
  }

  let unitIsInForest = tileGroup[0][0].forest;
  let unitIsOnHill = tileGroup[0][0].hill;

  const compareTiles = (adjR, adjC, farR, farC) => {
    let adjTile = tileGroup[adjR][adjC];
    let farTile = tileGroup[farR][farC];

    if (unitIsInForest) {
      return;
    }
    if (adjTile.mountain) {
      return;
    }
    if (adjTile.hill && !farTile.mountain) {
      return;
    }
    if (adjTile.forest && !unitIsOnHill && !farTile.mountain && !farTile.hill) {
      return;
    }

    visible[farR][farC] = true;
  };

  // unit tile
  visible[0][0] = true;

  // directly left and right, and beyond
  visible[0][1] = true;
  visible[0][-1] = true;
  compareTiles(0, 1, 0, 2);
  compareTiles(0, -1, 0, -2);

  if (row % 2 == 0) {
  } else {
    // top left
    visible[-1][-1] = true;
    compareTiles(-1, -1, -2, -1);

    // top right
    visible[-1][0] = true;
    compareTiles(-1, 0, -2, 1);

    // bottom left
    visible[1][-1] = true;
    compareTiles(1, -1, 2, -1);

    // bottom right
    visible[1][0] = true;
    compareTiles(1, 0, 2, 1);

    // between top left and top right
    compareTiles(-1, -1, -2, 0);
    compareTiles(-1, 0, -2, 0);

    // between bottom left and bottom right
    compareTiles(1, -1, 2, 0);
    compareTiles(1, 0, 2, 0);
  }

  // Return all pairs that are still true.

  let coords = [];

  for (let r1 = -2; r1 <= 2; r1++) {
    let r = row + r1;
    if (r < 0) {
      continue;
    }
    if (r >= numRows) {
      break;
    }
    for (let c1 = -2; c1 <= 2; c1++) {
      if (visible[r1][c1]) {
        let c = helpers.getColumn(numCols, column + c1);
        coords.push([r, c]);
      }
    }
  }

  return coords;
};

const getVisibleTilesFunction = (data) => {
  let [numRows, numCols] = data.game.mapSize;

  return (row, col) => {
    return getVisibleTiles(numRows, numCols, data.tiles, row, col);
  };
};

module.exports = getVisibleTilesFunction;
