
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

    const isMountain = (r1, c1) => {
      return tileGroup[r1][c1].mountain;
    };

    const isHill = (r1, c1) => {
      return tileGroup[r1][c1].hill;
    };

    const isClear = (r1, c1) => {
      return !tileGroup[r1][c1].forest;
    };

    const isFlat = (r1, c1) => {
      return !(isMountain(r1, c1) || isHill(r1, c1));
    };

    const isOpen = (r1, c1) => {
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

    const lookBehind = (row1, col1, row2, col2) => {
      if (isMountain(row1, col1)) {
        return;
      }

      // Unit is on a hill, OR adjacent tile is totally clear, OR 2 tiles away is a hill.
      if (isHill(0, 0) || isOpen(row1, col1) || isHill(row2, col2)) {
        saveTile(row2, col2);
      }
    };

    lookBehind(0, 1, 0, 2);
    lookBehind(0, -1, 0, -2);
    lookBehind(-1, 0, -2, 0);
    lookBehind(1, 0, 2, 0);

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
