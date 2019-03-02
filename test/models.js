process.env.NODE_ENV = 'test';
const expect = require('chai').expect;
const Game = require('../models/game');
const Tile = require('../models/tile');

const game = new Game({
  name: 'test game',
});

describe('Tile', function () {
  context('getTotalProduction()', function () {
    it('should return the sum of all production types', function (done) {
      const tile = new Tile({
        game: game,
        production: {
          food: 7,
          gold: 3,
          labor: 5,
          culture: 2,
          science: 9,
        },
      });
      expect(tile.getTotalProduction()).to.be.equal(26);
      done();
    });
  });
});
