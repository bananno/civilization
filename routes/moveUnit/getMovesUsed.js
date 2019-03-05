
function getMovesUsed(unit, oldTile, newTile) {
  let movesUsed = 1;

  if (newTile.terrain.hill || newTile.terrain.forest) {
    if (unit.templateName != 'scout') {
      movesUsed += 1;
    }
  }

  if (newTile.road && oldTile.road) {
    movesUsed = Math.ceil(movesUsed / 2);
  }

  return movesUsed;
}

module.exports = getMovesUsed;
