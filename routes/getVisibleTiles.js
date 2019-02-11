
const getVisibleTilesFunction = (data) => {
  let [numRows, numCols] = data.game.mapSize;

  return (row, column) => {
    let tileGroup = {};

    for (let r1 = -2; r1 <= 2; r1++) {
      let r = row + r1;
      tileGroup[r1] = [];

      for (let c1 = -2; c1 <= 2; c1++) {
        let c = column + c1;

        if (c < 0) {
          c += numCols;
        } else if (c >= numCols) {
          c -= numCols;
        }

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

    let coords = [];

    const isFlat = (r1, c1) => {
      return !(tileGroup[r1][c1].mountain || tileGroup[r1][c1].hill || tileGroup[r1][c1].forest);
    };

    const saveTile = (r1, c1) => {
      let r = row + r1;
      let c = column + c1;

      if (r < 0 || r >= numRows) {
        return;
      }

      if (c < 0) {
        c += numCols;
      } else if (c >= numCols) {
        c -= numCols;
      }

      coords.push([r, c]);
    };

    for (let r1 = -1; r1 <= 1; r1++) {
      for (let c1 = -1; c1 <= 1; c1++) {
        saveTile(r1, c1);
      }
    }

    if (isFlat(-1, 0)) {
      saveTile(-2, 0);
    }
    if (isFlat(0, -1)) {
      saveTile(0, -2);
    }
    if (isFlat(1, 0)) {
      saveTile(2, 0);
    }
    if (isFlat(0, 1)) {
      saveTile(0, 2);
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
