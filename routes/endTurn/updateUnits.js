
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

    if (unit.templateName != 'worker') {
      return completeUpdate();
    }

    if (orders == 'build road') {
      tileData.roadProgress = tile.roadProgress + unit.movesRemaining;

      if (tileData.roadProgress >= 5) {
        tileData.road = true;
        unitData.orders = null;
      }

      return completeUpdate();
    }

    const incrementProgress = () => {
      tileData.progress = tile.progress + unit.movesRemaining;
    };

    const projectIsDone = () => {
      unitData.orders = null;
      tileData.project = null;
      tileData.progress = 0;
      completeUpdate();
    };

    if (orders.match('remove')) {
      if (unit.movesRemaining < 1) {
        return completeUpdate();
      }

      tileData.improvement = null;
      tileData.production = tile.production;

      if (orders == 'remove farm') {
        tileData.production.food -= 1;
      } else if (orders == 'remove mine') {
        tileData.production.labor -= 1;
      }

      return projectIsDone();
    }

    if (orders == 'build farm') {
      incrementProgress();
      if (tileData.progress < 10) {
        return completeUpdate();
      }
      tileData.improvement = 'farm';
      tileData.production = tile.production;
      tileData.production.food += 1;
      return projectIsDone();
    }

    if (orders == 'build mine') {
      incrementProgress();
      if (tileData.progress < 12) {
        return completeUpdate();
      }
      tileData.improvement = 'mine';
      tileData.production = tile.production;
      tileData.production.labor += 1;
      return projectIsDone();
    }

    if (orders == 'chop forest') {
      incrementProgress();
      if (tileData.progress < 5) {
        return completeUpdate();
      }
      tileData.terrain = tile.terrain;
      tileData.terrain.forest = false;
      return projectIsDone();
    }

    completeUpdate();
  });
}

module.exports = updateUnits;
