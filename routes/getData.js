const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const City = require('../models/city');
const Unit = require('../models/unit');

const helpers = require('./helpers');
const buildingList = require('../models/buildingList');
const unitList = require('../models/unitList');
const technologyList = require('../models/technologyList');

function getData(req, res, next, callback) {
  collectFromDatabase(req, res, next, data => {
    data.turnPlayerId = data.players[data.game.nextPlayer]._id;

    data.playerRef = {};
    data.cityRef = {};
    data.tileRef = {};
    data.unitRef = {};

    const [numRows, numCols] = data.game.mapSize;

    data.help = helpers.makeHelperFunctions(data);

    // Initialize player production.
    data.players.forEach(player => {
      data.playerRef[player._id] = player;

      player.production = {
        gold: 0,
        food: 0,
        labor: 0,
        culture: 0,
        science: 0,
      };
    });

    data.currentPlayer = data.playerRef[data.turnPlayerId];

    data.technologyList = getTechnologyList(data.currentPlayer, technologyList);
    data.buildingList = mapTechRequirements(buildingList, data.technologyList);
    data.unitList = mapTechRequirements(unitList, data.technologyList);

    // Initialize city production.
    // Calculate production from each city's buildings.
    data.cities.forEach(city => {
      data.cityRef[city._id] = city;

      city.production = {
        gold: 0,
        food: 0,
        labor: 0,
        culture: 0,
        science: 0,
      };

      city.isCoastal = false;

      helpers.forEachAdjacentTile(data.game.mapSize[0], data.game.mapSize[1], data.tiles,
          city.location[0], city.location[1], (tile) => {
        if (tile.terrain.water) {
          city.isCoastal = true;
        }
      });

      let extraLaborPercentage = 0;

      city.buildings.forEach(i => {
        city.production.gold += buildingList[i].production.gold;
        city.production.food += buildingList[i].production.food;
        city.production.labor += buildingList[i].production.labor;
        city.production.culture += buildingList[i].production.culture;
        city.production.science += buildingList[i].production.science;

        if (buildingList[i].name == 'workshop') {
          extraLaborPercentage += 10;
        }
      });

      city.production.labor += Math.round((city.production.labor * extraLaborPercentage) / 100);
    });

    // Calculate production of all tiles that are worked by any city.
    data.tiles.forEach(tile => {
      data.tileRef[tile._id] = tile;
      data.tileRef[tile.location[0]] = data.tileRef[tile.location[0]] || [];
      data.tileRef[tile.location[0]][tile.location[1]] = tile;

      tile.isDiscovered = tile.discovered.indexOf(data.currentPlayer._id) >= 0;

      if (tile.worked) {
        let city = data.cityRef[tile.worked];
        city.production.gold += tile.production.gold;
        city.production.food += tile.production.food;
        city.production.labor += tile.production.labor;
        city.production.culture += tile.production.culture;
        city.production.science += tile.production.science;
      }
    });

    // Calculate each player's production per turn as the sum of all cities' production.
    // Convert city labor to another form of production, if applicable.
    data.cities.forEach(city => {
      let player = data.playerRef[city.player];
      player.production.gold += city.production.gold;
      player.production.food += city.production.food;
      player.production.labor += city.production.labor;
      player.production.culture += city.production.culture;
      player.production.science += city.production.science;

      let prod = city.project.category;

      if (prod == 'gold' || prod == 'culture' || prod == 'science') {
        player.production[prod] += Math.floor(city.production.labor / 2);
      }
    });

    // Create ref object to easily find units by ID.
    data.units.forEach(unit => {
      data.unitRef[unit._id] = unit;
    });

    callback(data);
  });
}

function collectFromDatabase(req, res, next, callback) {
  const gameId = req.session ? req.session.gameId : null;
  Game.findById(gameId, (error, game) => {
    if (error) {
      return next(error);
    }
    if (game == null) {
      return res.redirect('/loadGame');
    }
    Player.find({ game: game }, (error, players) => {
      if (error) {
        return next(error);
      }
      Tile.find({ game: game }, (error, tiles) => {
        if (error) {
          return next(error);
        }
        City.find({ game: game }, (error, cities) => {
          if (error) {
            return next(error);
          }
          Unit.find({ game: game }, (error, units) => {
            if (error) {
              return next(error);
            }

            callback({
              game: game,
              players: players,
              tiles: tiles,
              cities: cities,
              units: units,
            });
          });
        });
      });
    });
  });
}

function findTechByName(techList, techName) {
  return techList.filter(tech => tech.name == techName)[0];
}

function getTechnologyList(player, techList) {
  const techIsFinished = tech => {
    return tech.isFinished || player.technologies.indexOf(tech.index) >= 0;
  };

  return techList.map((tech, i) => {
    tech.index = i;

    tech.isFinished = techIsFinished(tech);
    tech.isBlocked = false;

    tech.blocked.forEach(blockedName => {
      const tech2 = findTechByName(techList, blockedName);
      if (!techIsFinished(tech2)) {
        tech.isBlocked = true;
      }
    });

    tech.isAvailable = !tech.isBlocked && !tech.isFinished;
    return tech;
  });
}

function mapTechRequirements(templateList, techList) {
  return templateList.map(template => {
    template.isAvailable = true;
    template.technologies.forEach(techName => {
      if (!findTechByName(techList, techName).isFinished) {
        template.isAvailable = false;
      }
    });
    return template;
  });
}

module.exports = getData;
