const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const City = require('../models/city');
const Unit = require('../models/unit');
const buildingTypes = require('../models/buildingTypes');
const unitTypes = require('../models/unitTypes');

function getData(req, res, next, callback) {
  collectFromDatabase(req, res, next, data => {
    data.buildingTypes = buildingTypes;
    data.unitTypes = unitTypes;

    data.turnPlayerId = data.players[data.game.nextPlayer]._id;

    data.playerProduction = {};
    data.cityProduction = {};

    // Initialize player output.
    data.players.forEach(player => {
      data.playerProduction[player._id] = {
        gold: 0,
        food: 0,
        labor: 0,
      };
    });

    // Initialize city output.
    // Calculate output from each city's buildings.
    data.cities.forEach(city => {
      data.cityProduction[city._id] = {
        gold: 0,
        food: 0,
        labor: 0,
      };

      city.buildings.forEach(i => {
        data.cityProduction[city._id].gold += buildingTypes[i].gold;
        data.cityProduction[city._id].food += buildingTypes[i].food;
        data.cityProduction[city._id].labor += buildingTypes[i].labor;
      });
    });

    // Calculate output of all tiles that are worked by any city.
    data.tiles.forEach(tile => {
      if (tile.worked) {
        data.cityProduction[tile.worked].gold += tile.production.gold;
        data.cityProduction[tile.worked].food += tile.production.food;
        data.cityProduction[tile.worked].labor += tile.production.labor;
      }
    });

    // Calculate each player's gold per turn as the sum of all cities' gold.
    // Convert city production to gold, if applicable.
    data.cities.forEach(city => {
      data.playerProduction[city.player].gold += data.cityProduction[city._id].gold;
      data.playerProduction[city.player].food += data.cityProduction[city._id].food;
      data.playerProduction[city.player].labor += data.cityProduction[city._id].labor;

      if (city.project.category == 'gold') {
        let cityLabor = data.cityProduction[city._id].labor;
        data.playerProduction[city.player].gold += Math.floor(cityLabor / 2);
      }
    });

    callback(data);
  });
}

function collectFromDatabase(req, res, next, callback) {
  Game.findById(req.session.gameId, (error, game) => {
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

module.exports = getData;
