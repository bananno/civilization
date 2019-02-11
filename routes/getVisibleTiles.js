
const immediateCorners = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const immediateEdges = [[-1, 0], [0, 1], [1, 0], [0, -1]];

const getVisibleTilesFunction = (data) => {
  let [numRows, numCols] = data.game.mapSize;

  return (row, column) => {
    let visible = [];
    let tileGroup = [];

    for (let r1 = -2; r1 <= 2; r1++) {
      let r = row + r1;
      visible[r1] = [];
      tileGroup[r1] = [];

      for (let c1 = -2; c1 <= 2; c1++) {
        let c = column + c1;

        if (c < 0) {
          c += numCols;
        } else if (c >= numCols) {
          c -= numCols;
        }

        visible[r1][c1] = true;
        tileGroup[r1][c1] = {
          mountain: false,
          hill: false,
          forest: false,
        };

        let tile = findTile(data.tiles, r, c);

        if (tile) {
          tileGroup[r1][c1].mountain = tile.terrain.mountain;
          tileGroup[r1][c1].hill = tile.terrain.hill;
          tileGroup[r1][c1].forest = tile.terrain.forest;
        }
      }
    }

    // A mountain in an immediate corner obscures 3 tiles behind it.
    // A mountain in an immediate edge obscures 1 tile directly behind it.

    immediateCorners.forEach(pair => {
      let [r1, c1] = pair;
      if (tileGroup[r1][c1].mountain) {
        visible[r1 * 2][c1 * 2] = false;
        visible[r1 * 2][c1] = false;
        visible[r1][c1 * 2] = false;
      }
    });

    immediateEdges.forEach(pair => {
      let [r1, c1] = pair;
      if (tileGroup[r1][c1].mountain) {
        visible[r1 * 2][c1 * 2] = false;
      }
    });

    // If the unit is NOT on a hill:
    // A hill in an adjacent edge obscures the tile directly behind it.
    // A forest in an adjacent edge obscures the non-hill/mountain tiles directly behind it.

    if (!tileGroup[0][0].hill) {
      immediateEdges.forEach(pair => {
        let [r1, c1] = pair;
        if (tileGroup[r1][c1].hill) {
          visible[r1 * 2][c1 * 2] = false;
        } else if (tileGroup[r1][c1].forest && !tileGroup[r1 * 2][c1 * 2].hill) {
          visible[r1 * 2][c1 * 2] = false;
        }
      });
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
          let c = column + c1;
          if (c < 0) {
            c += numCols;
          } else if (c >= numCols) {
            c -= numCols;
          }
          coords.push([r, c]);
        }
      }
    }

    return coords;
  };

  return getVisibleTiles;
};

function findTile(tiles, row, column) {
  if (row.constructor == Array) {
    [row, column] = row;
  }
  return tiles.filter(tile => {
    return tile.row == row && tile.column == column;
  })[0];
}

module.exports = getVisibleTilesFunction;
