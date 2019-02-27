process.env.NODE_ENV = 'test';
const assert = require('assert');
const getHelpers = require('../routes/helpers');

const data = {
  game: {
    mapSize: [20, 40],
  },
};

const help = getHelpers.makeHelperFunctions(data);

describe('Helpers', () => {
  describe('#getColumn(colNumber)', () => {
    it('should return given number if it is between 0 and the number of columns', () => {
      assert.equal(help.getColumn(0), 0);
      assert.equal(help.getColumn(10), 10);
      assert.equal(help.getColumn(39), 39);
    });
    it('should return the difference if given number is less than 0', () => {
      assert.equal(help.getColumn(-1), 39);
      assert.equal(help.getColumn(-10), 30);
    });
    it('should return the difference if given number is less more than number of columns', () => {
      assert.equal(help.getColumn(40), 0);
      assert.equal(help.getColumn(50), 10);
    });
  });

  describe('#getTileTotalProduction(tile)', () => {
    it('should return the sum of all production types for given tile', () => {
      const tile = {
        production: {
          gold: 7, food: 3, labor: 5, culture: 2, science: 9
        }
      };
      assert.equal(help.getTileTotalProduction(tile), 26);
    });
  });

  describe('#sameLocation(pair1, pair2)', () => {
    it('should return true when the two pairs are equal', () => {
      assert.equal(help.sameLocation([17, 9], [17, 9]), true);
    });
    it('should return false when the two pairs are not equal', () => {
      assert.equal(help.sameLocation([17, 9], [11, 9]), false);
    });
  });

  describe('#isSamePlayer(player1, player2)', () => {
    it('should return true when both values are null', () => {
      assert.equal(help.isSamePlayer(null, null), true);
    });
    it('should return false when one value is null but not the other', () => {
      assert.equal(help.isSamePlayer('abcde', null), false);
    });
    it('should return true/false by comparing two strings', () => {
      assert.equal(help.isSamePlayer('abcde', 'abcde'), true);
      assert.equal(help.isSamePlayer('abcde', 'abcdd'), false);
    });
    it('should return true/false by comparing ID attributes of two objects', () => {
      assert.equal(help.isSamePlayer({_id: 'abcde'}, {_id: 'abcde'}), true);
      assert.equal(help.isSamePlayer({_id: 'abcde'}, {_id: 'abcdd'}), false);
    });
    it('should work the same way given one string and one object', () => {
      assert.equal(help.isSamePlayer({_id: 'abcde'}, 'abcde'), true);
      assert.equal(help.isSamePlayer({_id: 'abcde'}, 'abcdd'), false);
      assert.equal(help.isSamePlayer('abcde', {_id: 'abcde'}), true);
      assert.equal(help.isSamePlayer('abcde', {_id: 'abcdd'}), false);
    });
  });
});
