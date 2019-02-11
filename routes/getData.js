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

    data.playerRef = {};
    data.cityRef = {};

    // Initialize player production.
    data.players.forEach(player => {
      data.playerRef[player._id] = player;

      player.production = {
        gold: 0,
        food: 0,
        labor: 0,
      };
    });

    // Initialize city production.
    // Calculate production from each city's buildings.
    data.cities.forEach(city => {
      data.cityRef[city._id] = city;

      city.production = {
        gold: 0,
        food: 0,
        labor: 0,
      };

      city.buildings.forEach(i => {
        city.production.gold += buildingTypes[i].production.gold;
        city.production.food += buildingTypes[i].production.food;
        city.production.labor += buildingTypes[i].production.labor;
      });
    });

    // Calculate production of all tiles that are worked by any city.
    data.tiles.forEach(tile => {
      if (tile.worked) {
        let city = data.cityRef[tile.worked];
        city.production.gold += tile.production.gold;
        city.production.food += tile.production.food;
        city.production.labor += tile.production.labor;
      }
    });

    // Calculate each player's production per turn as the sum of all cities' production.
    // Convert city labor to gold, if applicable.
    data.cities.forEach(city => {
      let player = data.playerRef[city.player];
      player.production.gold += city.production.gold;
      player.production.food += city.production.food;
      player.production.labor += city.production.labor;

      if (city.project.category == 'gold') {
        player.production.gold += Math.floor(city.production.labor / 2);
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
