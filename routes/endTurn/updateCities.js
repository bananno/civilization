const {
  createUnit,
  workTile,
  claimTile,
} = require('../import');

const cityGrowthRate = [0, 15, 22, 30, 40, 51, 63, 76, 90, 105, 121, 138, 155, 174, 194, 214,
  235, 258, 280, 304, 329, 354, 380, 407, 435, 464, 493, 523, 554, 585, 617, 650, 684, 719, 754,
  790, 826, 863, 901, 940, 979];

function updateCities(data) {
  data.cities.forEach(city => {
    if (!data.help.isCurrentPlayer(city.player)) {
      return;
    }

    const cityData = {};

    cityData.storage = city.storage;

    const completeUpdate = async () => {
      await city.update(cityData);
    };

    const workNewTile = async () => {
      await workTile.auto(data, city);
    };

    const claimNewTile = async () => {
      await claimTile.auto(data, city);
    };

    // LABOR & PROJECT

    let projectCategory = city.project.category;
    let projectIndex = city.project.index;

    let laborSoFar = 0;
    let laborNeeded = 0;
    let projectIsComplete = false;
    let allowGrowth = true;

    if (city.projectAutomate && (projectCategory == null || projectCategory == 'gold'
        || projectCategory == 'science' || projectCategory == 'culture')) {
      const newProject = chooseNextProject(data, city);
      projectCategory = newProject.category;
      projectIndex = newProject.index;
      cityData.project = {
        category: projectCategory,
        index: projectIndex,
      };
      cityData.projectProgress[projectCategory][projectIndex]
        = cityData.projectProgress[projectCategory][projectIndex] || 0;
    }

    if (projectCategory == 'unit' || projectCategory == 'building') {
      cityData.projectProgress = city.projectProgress;
      cityData.projectProgress[projectCategory][projectIndex] += city.production.labor;
      cityData.projectProgress[projectCategory][projectIndex] += city.storage.labor;

      cityData.storage.labor = 0;

      laborSoFar = cityData.projectProgress[projectCategory][projectIndex];

      if (projectCategory == 'unit') {
        laborNeeded = data.unitList[projectIndex].laborCost;
        if (data.unitList[projectIndex].name == 'settler') {
          allowGrowth = false;
        }
      } else if (projectCategory == 'building') {
        laborNeeded = data.buildingList[projectIndex].laborCost;
      }

      projectIsComplete = laborSoFar >= laborNeeded;
    }

    // CULTURE

    cityData.storage.culture += city.production.culture;

    const cultureNeededForGrowth = cityGrowthRate[city.borderExpansions + 1];

    if (cityData.storage.culture >= cultureNeededForGrowth) {
      claimNewTile();
      cityData.storage.culture -= cultureNeededForGrowth;
      cityData.borderExpansions = city.borderExpansions + 1;
    }

    // FOOD

    let foodEatenPerTurn = city.population * 2;
    let foodSurplus = city.production.food - foodEatenPerTurn;

    if (!allowGrowth && foodSurplus > 0) {
      foodSurplus = 0;
    }

    cityData.storage.food += foodSurplus;

    if (cityData.storage.food >= cityGrowthRate[city.population] && foodSurplus >= 2) {
      cityData.population = city.population + 1;
      cityData.storage.food -= cityGrowthRate[city.population];

      workNewTile();
    }

    if (projectIsComplete) {
      cityData.storage.labor = laborSoFar - laborNeeded;
      cityData.projectProgress[projectCategory][projectIndex] = 0;
      cityData.project = {
        category: null,
        index: null,
      };

      if (projectCategory == 'building') {
        cityData.buildings = city.buildings;
        cityData.buildings.push(projectIndex);
      } else if (projectCategory == 'unit') {
        createUnit({
          game: city.game,
          player: city.player,
          location: city.location.concat(),
          templateIndex: projectIndex,
        });
      }
    }

    // DONE

    completeUpdate();
  });
}

function chooseNextProject(data, city) {
  for (let i = 0; i < data.buildingList.length; i++) {
    if (city.buildings.indexOf(i) >= 0) {
      continue;
    }
    if (!data.buildingList[i].isAvailable) {
      continue;
    }
    return { category: 'building', index: i };
  }

  const existingWorkers = data.units.filter(unit => {
    return data.help.isCurrentPlayer(unit.player)
      && unit.templateName == 'worker';
  });

  if (existingWorkers.length == 0) {
    for (let i = 0; i < data.unitList.length; i++) {
      if (data.unitList[i].name == 'worker') {
        return { category: 'unit', index: i };
      }
    }
  }

  return { category: 'gold', index: 0 };
}

module.exports = updateCities;
