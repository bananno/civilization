
const helpers = {};

helpers.sameLocation = (arr1, arr2) => {
  return arr1[0] == arr2[0] && arr1[1] == arr2[1];
};

helpers.getColumn = (numCols, c) => {
  if (c < 0) {
    return c + numCols;
  }
  if (c >= numCols) {
    return c - numCols;
  }
  return c;
};

helpers.findUnit = (units, id) => {
  return units.filter(unit => {
    return unit._id == id;
  })[0];
};

helpers.findTile = (tiles, row, column) => {
  if (row.constructor == Array) {
    [row, column] = row;
  }
  return tiles.filter(tile => {
    return helpers.sameLocation(tile.location, [row, column]);
  })[0];
};

helpers.getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
};

helpers.booleanByPercentage = (percentage) => {
  return helpers.getRandomInt(0, 100) <= percentage;
};

helpers.isTileAdjacent = (numCols, oldRow, oldCol, newRow, newCol) => {
  let colDistance = newCol - oldCol;

  if (colDistance == numCols - 1) {
    colDistance = -1;
  } else if (colDistance == -(numCols - 1)) {
    colDistance = 1;
  }

  if (newRow == oldRow) {
    return Math.abs(colDistance) == 1;
  }

  if (Math.abs(oldRow - newRow) != 1) {
    return false;
  }

  if (colDistance == 0) {
    return true;
  }

  if (oldRow % 2 == 0) {
    return colDistance == 1;
  }

  return colDistance == -1;
};

helpers.forEachAdjacentTile = (numRows, numCols, tiles, row, col, callback) => {
  const shift = -(row % 2);
  const pairs = [
    [-1, shift],
    [-1, 1 + shift],
    [0, -1],
    [0, 1],
    [1, shift],
    [1, 1 + shift],
  ];

  pairs.forEach(pair => {
    const r = row + pair[0];
    if (r < 0 || r >= numRows) {
      return;
    }
    const c = helpers.getColumn(numCols, col + pair[1]);
    const tile = helpers.findTile(tiles, r, c);
    callback(tile, r, c);
  });
};

module.exports = helpers;
