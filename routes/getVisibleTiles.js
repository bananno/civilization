
const getVisibleTilesFunction = (data) => {
  let [numRows, numCols] = data.game.mapSize;

  return (row, column) => {
    let coords = [];

    for (let r = row - 2; r <= row + 2; r++) {
      if (r < 0) {
        continue;
      }
      if (r >= numRows) {
        break;
      }
      for (let c1 = column - 2; c1 <= column + 2; c1++) {
        let c = c1;
        if (c < 0) {
          c += numCols;
        } else if (c >= numCols) {
          c -= numCols;
        }

        coords.push([r, c]);
      }
    }

    return coords;
  };

  return getVisibleTiles;
}

module.exports = getVisibleTilesFunction;
