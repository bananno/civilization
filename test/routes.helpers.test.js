process.env.NODE_ENV = 'test';

const assert = require('assert');
const getHelpers = require('../routes/helpers');

const data = {
  game: {
    mapSize: [20, 40],
  },
};

const dataHelp = getHelpers.makeHelperFunctions(data);

describe('Helpers', () => {
  describe('#sameLocation()', () => {
    it('should return true when the two pairs are equal', () => {
      assert.equal(dataHelp.sameLocation([17, 9], [17, 9]), true);
    });
    it('should return false when the two pairs are not equal', () => {
      assert.equal(dataHelp.sameLocation([17, 9], [11, 9]), false);
    });
  });
});
