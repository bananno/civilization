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
  describe('getAdjacentDirection(fromRow, fromCol, toRow, toCol)', () => {
    it('directly left or right when in middle of map', () => {
      assert.equal(help.getAdjacentDirection(10, 10, 10, 9), 'left');
      assert.equal(help.getAdjacentDirection(10, 10, 10, 11), 'right');
    });
    it('directly left or right overlapping with map edge', () => {
      assert.equal(help.getAdjacentDirection(10, 0, 10, 39), 'left');
      assert.equal(help.getAdjacentDirection(10, 39, 10, 0), 'right');
    });
    it('up and down, starting in an even row, in middle of map', () => {
      assert.equal(help.getAdjacentDirection(10, 10, 9, 10), 'up-left');
      assert.equal(help.getAdjacentDirection(10, 10, 9, 11), 'up-right');
      assert.equal(help.getAdjacentDirection(10, 10, 11, 10), 'down-left');
      assert.equal(help.getAdjacentDirection(10, 10, 11, 11), 'down-right');
    });
    it('up and down, starting in an even row, overlapping with map edge', () => {
      assert.equal(help.getAdjacentDirection(10, 0, 9, 0), 'up-left');
      assert.equal(help.getAdjacentDirection(10, 39, 9, 0), 'up-right');
      assert.equal(help.getAdjacentDirection(10, 0, 11, 0), 'down-left');
      assert.equal(help.getAdjacentDirection(10, 39, 11, 0), 'down-right');
    });
    it('up and down, starting in an odd row, in middle of map', () => {
      assert.equal(help.getAdjacentDirection(11, 10, 10, 9), 'up-left');
      assert.equal(help.getAdjacentDirection(11, 10, 10, 10), 'up-right');
      assert.equal(help.getAdjacentDirection(11, 10, 12, 9), 'down-left');
      assert.equal(help.getAdjacentDirection(11, 10, 12, 10), 'down-right');
    });
    it('up and down, starting in an odd row, overlapping with map edge', () => {
      assert.equal(help.getAdjacentDirection(11, 0, 10, 39), 'up-left');
      assert.equal(help.getAdjacentDirection(11, 39, 10, 39), 'up-right');
      assert.equal(help.getAdjacentDirection(11, 0, 12, 39), 'down-left');
      assert.equal(help.getAdjacentDirection(11, 39, 12, 39), 'down-right');
    });
    it('should work the same way whether one, both, or neither pair is an array', () => {
      assert.equal(help.getAdjacentDirection(10, 10, 10, 9), 'left');
      assert.equal(help.getAdjacentDirection([10, 10], [10, 9]), 'left');
      assert.equal(help.getAdjacentDirection([10, 10], 10, 9), 'left');
      assert.equal(help.getAdjacentDirection(10, 10, [10, 9]), 'left');
    });
  });

  describe('getColumn(colNumber)', () => {
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

  describe('getTileTotalProduction(tile)', () => {
    it('should return the sum of all production types for given tile', () => {
      const tile = {
        production: {
          gold: 7, food: 3, labor: 5, culture: 2, science: 9
        }
      };
      assert.equal(help.getTileTotalProduction(tile), 26);
    });
  });

  describe('sameLocation(pair1, pair2)', () => {
    it('should return true when the two pairs are equal', () => {
      assert.equal(help.sameLocation([17, 9], [17, 9]), true);
    });
    it('should return false when the two pairs are not equal', () => {
      assert.equal(help.sameLocation([17, 9], [11, 9]), false);
    });
  });

  describe('isSamePlayer(player1, player2)', () => {
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
