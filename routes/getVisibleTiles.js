
const getVisibleTilesFunction = (data) => {
  let [numRows, numCols] = data.game.mapSize;

  return (row, column) => {
    let coords = [];

    const isFlat = (r1, c1) => {
      let r = row + r1;
      let c = column + c1;

      return true;
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

module.exports = getVisibleTilesFunction;
