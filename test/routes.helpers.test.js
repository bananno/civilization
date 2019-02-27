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
  describe('#sameLocation(pair1, pair2)', () => {
    it('should return true when the two pairs are equal', () => {
      assert.equal(help.sameLocation([17, 9], [17, 9]), true);
    });
    it('should return false when the two pairs are not equal', () => {
      assert.equal(help.sameLocation([17, 9], [11, 9]), false);
    });
  });

  describe('#isSamePlayer(player1, player2)', () => {
    it('should return true when the values are two equal strings', () => {
      assert.equal(help.isSamePlayer('abcde', 'abcde'), true);
    });
    it('should return false when the values are two unequal strings', () => {
      assert.equal(help.isSamePlayer('abcde', 'abcdd'), false);
    });
    it('should return true when the values are two objects with equal ID attributes', () => {
      assert.equal(help.isSamePlayer({_id: 'abcde'}, {_id: 'abcde'}), true);
    });
    it('should return false when the values are two objects with unequal ID attributes', () => {
      assert.equal(help.isSamePlayer({_id: 'abcde'}, {_id: 'abcdd'}), false);
    });
    it('should work the same way given one string and one object', () => {
      assert.equal(help.isSamePlayer({_id: 'abcde'}, 'abcde'), true);
    });
    it('should work the same way given one string and one object', () => {
      assert.equal(help.isSamePlayer({_id: 'abcde'}, 'abcdd'), false);
    });
    it('should work the same way given one string and one object', () => {
      assert.equal(help.isSamePlayer('abcde', {_id: 'abcde'}), true);
    });
    it('should work the same way given one string and one object', () => {
      assert.equal(help.isSamePlayer('abcde', {_id: 'abcdd'}), false);
    });
  });
});
