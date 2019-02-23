
function updateUnits(data) {
  data.units.forEach(unit => {
    if (!data.help.isCurrentPlayer(unit.player)) {
      return;
    }

    const tile = data.help.findTile(unit.location);
    const unitData = {};
    const tileData = {};

    const completeUpdate = async () => {
      await unit.update(unitData);
      await tile.update(tileData);
    };

    unitData.movesRemaining = unit.moves;

    let orders = unit.orders;

    if (orders == null) {
      if (unit.automate && unit.templateName == 'worker') {
        if (tile.improvement == null) {
          if (tile.terrain.forest) {
            orders = 'chop forest';
            tileData.project = 'chop forest';
          } else if (tile.terrain.hill) {
            orders = 'build mine';
            tileData.project = 'build mine';
          } else {
            orders = 'build farm';
            tileData.project = 'build farm';
          }
          unitData.orders = orders;
        }
      }
    }

    if (orders == null) {
      return completeUpdate();
    }

    if (orders == 'skip turn') {
      unitData.orders = null;
      return completeUpdate();
    }

    if (orders.match('build') || orders.match('remove') || orders == 'chop forest') {
      let projectDone = false;

      if (orders == 'build farm' || orders == 'build mine'
          || orders == 'chop forest') {
        tileData.progress = tile.progress + unit.movesRemaining;
      } else if (orders == 'build road') {
        tileData.roadProgress = tile.roadProgress + unit.movesRemaining;
      }

      if (orders == 'build farm' && tileData.progress >= 10) {
        projectDone = true;
        tileData.improvement = 'farm';
        tileData.production = tile.production;
        tileData.production.food += 1;
        unitData.orders = null;
      } else if (orders == 'build mine' && tileData.progress >= 12) {
        projectDone = true;
        tileData.improvement = 'mine';
        tileData.production = tile.production;
        tileData.production.labor += 1;
        unitData.orders = null;
      } else if (orders == 'chop forest' && tileData.progress >= 5) {
        projectDone = true;
        tileData.terrain = tile.terrain;
        tileData.terrain.forest = false;
      } else if (orders == 'remove farm' && unit.movesRemaining > 0) {
        projectDone = true;
        tileData.improvement = null;
        tileData.production = tile.production;
        tileData.production.food -= 1;
      } else if (orders == 'remove mine' && unit.movesRemaining > 0) {
        projectDone = true;
        tileData.improvement = null;
        tileData.production = tile.production;
        tileData.production.labor -= 1;
      } else if (orders == 'build road' && tileData.roadProgress >= 5) {
        tileData.road = true;
        unitData.orders = null;
      }

      if (projectDone) {
        unitData.orders = null;
        tileData.project = null;
        tileData.progress = 0;
      }
    }

    completeUpdate();
  });
}

module.exports = updateUnits;
