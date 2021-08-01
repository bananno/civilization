process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const sinon = require('sinon');
const {Game, Player, Unit} = require('../models');

const game = new Game();
const player = new Player({game});
const otherPlayer = new Player({game});
const unit = new Unit({game, player});

describe('Unit', () => {
  describe('belongsToActiveUser()', () => {
    let resultStatic, resultInstance;

    beforeEach(() => {
      sinon.stub(Game, 'findById');
      sinon.stub(Player, 'find');
      Game.findById.returns(game);
      Player.find.returns([player, otherPlayer]);
    });

    afterEach(() => {
      Game.findById.restore();
      Player.find.restore();
    });

    describe('when the unit belongs to the active user', () => {
      beforeEach(async () => {
        game.nextPlayer = 0;
        resultStatic = await Unit.belongsToActiveUser(unit);
        instanceStatic = await unit.belongsToActiveUser();
      });
      it('returns true static version', () => {
        expect(resultStatic).to.equal(true);
      });
      it('returns true instance version', () => {
        expect(instanceStatic).to.equal(true);
      });
    });

    describe('when the unit does not belong to the active user', () => {
      beforeEach(async () => {
        game.nextPlayer = 1;
        resultStatic = await Unit.belongsToActiveUser(unit);
        instanceStatic = await unit.belongsToActiveUser();
      });
      it('returns false static version', () => {
        expect(resultStatic).to.equal(false);
      });
      it('returns false instance version', () => {
        expect(instanceStatic).to.equal(false);
      });
    });
  });
});
