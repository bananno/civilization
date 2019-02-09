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

    data.playerOutput = {};
    data.cityOutput = {};

    // Initialize player output.
    data.players.forEach(player => {
      data.playerOutput[player._id] = {
        gold: 0,
        food: 0,
        production: 0,
      };
    });

    // Initialize city output.
    // Calculate output from each city's buildings.
    data.cities.forEach(city => {
      data.cityOutput[city._id] = {
        gold: 0,
        food: 0,
        production: 0,
      };

      city.buildings.forEach(i => {
        data.cityOutput[city._id].gold += buildingTypes[i].gold;
        data.cityOutput[city._id].food += buildingTypes[i].food;
        data.cityOutput[city._id].production += buildingTypes[i].production;
      });
    });

    // Calculate output of all tiles that are worked by any city.
    data.tiles.forEach(tile => {
      if (tile.worked) {
        data.cityOutput[tile.worked].gold += tile.gold;
        data.cityOutput[tile.worked].food += tile.food;
        data.cityOutput[tile.worked].production += tile.production || 0;
      }
    });

    // Calculate each player's gold per turn as the sum of all cities' gold.
    // Convert city production to gold, if applicable.
    data.cities.forEach(city => {
      data.playerOutput[city.player].gold += data.cityOutput[city._id].gold;
      data.playerOutput[city.player].food += data.cityOutput[city._id].food;
      data.playerOutput[city.player].production += data.cityOutput[city._id].production;

      if (city.project.category == 'gold') {
        let cityProduction = data.cityOutput[city._id].production;
        data.playerOutput[city.player].gold += Math.floor(cityProduction / 2);
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
