
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
      const newOrders = getAutomaticOrders(unit);
      if (newOrders) {
        orders = newOrders;
        tileData.project = newOrders;
        unitData.orders = orders;
      } else {
        return completeUpdate();
      }
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
        tileData.roadProgress = 0;
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

    return completeUpdate();
  });
}

function getAutomaticOrders(unit, tile) {
  if (!unit.automate) {
    return false;
  }

  if (unit.templateName != 'worker') {
    return false;
  }

  if (tile.improvement) {
    return false;
  }

  if (tile.terrain.forest) {
    return 'chop forest';
  }

  if (tile.terrain.hill) {
    return 'build mine';
  }

  return 'build farm';
}

module.exports = updateUnits;
