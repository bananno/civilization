process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const router = require('../routes');
const {Game, Player, Session, Unit} = require('../models');
const UNIT_ORDERS = require('../models/unitOrders');

const mockGame = new Game();

const mockPlayer1 = new Player({game: mockGame._id});
const mockPlayer2 = new Player({game: mockGame._id});

const mockUnit = new Unit({
  game: mockGame._id,
  player: mockPlayer1._id,
  movesRemaining: 2,
  location: [5, 6],
});
const mockUnitId = `${mockUnit._id}`;

const app = express();
app.use('/', router);

app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: err
  });
});

let res;

function it_triesToFindUnitByIdAndActiveGame() {
  it('tries to find the unit by id and active game', () => {
    sinon.assert.calledWith(Unit.findOne, {_id: mockUnitId, game: mockGame._id});
  });
}

function it_triesToDeleteTheUnit() {
  it('tries to delete the unit', () => {
    sinon.assert.calledWith(Unit.deleteOne, {_id: mockUnitId});
  });
}
function it_doesNotTryToDeleteTheUnit() {
  it('does not try to delete the unit', () => {
    sinon.assert.notCalled(Unit.deleteOne);
  });
}

function it_triesToUpdateTheUnit(updateObj) {
  it('tries to update the unit', () => {
    sinon.assert.calledWith(Unit.updateOne, {_id: mockUnitId}, updateObj, sinon.match.func);
  });
}
function it_doesNotTryToUpdateTheUnit() {
  it('does not try to update the unit', () => {
    sinon.assert.notCalled(Unit.updateOne);
  });
}

function expectCodeAndText(code, text) {
  expect(res.statusCode).to.equal(code);
  expect(res.text).to.equal(text);
}

describe('Unit Routes', () => {
  beforeEach(() => {
    sinon.stub(Unit, 'belongsToActiveUser');
    sinon.stub(Unit, 'deleteOne');
    sinon.stub(Unit, 'findOne');
    sinon.stub(Unit, 'updateOne');

    Unit.belongsToActiveUser.returns(true);
  });

  afterEach(() => {
    Unit.belongsToActiveUser.restore();
    Unit.deleteOne.restore();
    Unit.findOne.restore();
    Unit.updateOne.restore();
  });

  describe('delete', () => {
    describe('when there is no active game', () => {
      beforeEach(async () => {
        Session.getCurrentGameId = () => undefined;
        res = await request(app).delete(`/unit/${mockUnitId}`);
      });
      it('does not bother to try to find the unit', () => {
        sinon.assert.notCalled(Unit.findOne);
      });
      it_doesNotTryToDeleteTheUnit();
      it('fails with 401 unauthorized', () => {
        expect(res.statusCode).to.equal(401);
        expect(res.text).to.equal('no active game');
      });
    });

    describe('when there is an active game', () => {
      beforeEach(() => {
        Session.getCurrentGameId = () => mockGame._id;
      });

      describe('when the query throws an error', () => {
        beforeEach(async () => {
          Unit.findOne.yields('fake error message', null);
          res = await request(app).delete(`/unit/${mockUnitId}`);
        });
        it_triesToFindUnitByIdAndActiveGame();
        it_doesNotTryToDeleteTheUnit();
        it('fails with 500 and sends the error message', () => {
          expect(res.statusCode).to.equal(500);
          expect(res.text).to.equal('fake error message');
        });
      });

      describe('when the unit is not found', () => {
        beforeEach(async () => {
          Unit.findOne.yields(null, null);
          res = await request(app).delete(`/unit/${mockUnitId}`);
        });
        it_triesToFindUnitByIdAndActiveGame();
        it_doesNotTryToDeleteTheUnit();
        it('fails with 404 not found', () => {
          expect(res.statusCode).to.equal(404);
          expect(res.text).to.equal('unit not found');
        });
      });

      describe('when the unit is found', () => {
        beforeEach(() => {
          Unit.findOne.yields(null, mockUnit);
        });

        describe('but the unit does not belong to the active player', () => {
          beforeEach(async () => {
            Unit.belongsToActiveUser.returns(false);
            res = await request(app).delete(`/unit/${mockUnitId}`);
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_doesNotTryToDeleteTheUnit();
          it('fails with 401 unauthorized', () => {
            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('belongs to wrong user');
          });
        });

        describe('but the unit does not have any moves remaining', () => {
          beforeEach(async () => {
            mockUnit.movesRemaining = 0;
            res = await request(app).delete(`/unit/${mockUnitId}`);
          });
          afterEach(() => {
            mockUnit.movesRemaining = 2;
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_doesNotTryToDeleteTheUnit();
          it('fails with 401 unauthorized', () => {
            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('unit has no moves remaining');
          });
        });

        describe('and delete fails', () => {
          beforeEach(async () => {
            Unit.deleteOne.yields('fake deletion error');
            res = await request(app).delete(`/unit/${mockUnitId}`);
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_triesToDeleteTheUnit();
          it('fails with 500 and sends the error message', () => {
            expect(res.statusCode).to.equal(500);
            expect(res.text).to.equal('fake deletion error');
          });
        });

        describe('and delete succeeds', () => {
          beforeEach(async () => {
            Unit.deleteOne.yields(null, null);
            res = await request(app).delete(`/unit/${mockUnitId}`);
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_triesToDeleteTheUnit();
          it('succeeds with 200', () => {
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.equal('');
          });
        });
      });
    });
  });

  describe('post orders/skip', () => {
    const makeRequest = async () => {
      res = await request(app).post(`/unit/${mockUnitId}/orders/skip`);
    };

    describe('when there is no active game', () => {
      beforeEach(async () => {
        Session.getCurrentGameId = () => undefined;
        await makeRequest();
      });
      it('does not bother to try to find the unit', () => {
        sinon.assert.notCalled(Unit.findOne);
      });
      it_doesNotTryToUpdateTheUnit();
      it('fails with 401 unauthorized', () => {
        expectCodeAndText(401, 'no active game');
      });
    });

    describe('when there is an active game', () => {
      beforeEach(() => {
        Session.getCurrentGameId = () => mockGame._id;
      });

      describe('when the query throws an error', () => {
        beforeEach(async () => {
          Unit.findOne.yields('fake error message', null);
          await makeRequest();
        });
        it_triesToFindUnitByIdAndActiveGame();
        it_doesNotTryToUpdateTheUnit();
        it('fails with 500 and sends the error message', () => {
          expectCodeAndText(500, 'fake error message');
        });
      });

      describe('when the unit is not found', () => {
        beforeEach(async () => {
          Unit.findOne.yields(null, null);
          await makeRequest();
        });
        it_triesToFindUnitByIdAndActiveGame();
        it_doesNotTryToUpdateTheUnit();
        it('fails with 404 not found', () => {
          expectCodeAndText(404, 'unit not found');
        });
      });

      describe('when the unit is found', () => {
        beforeEach(() => {
          Unit.findOne.yields(null, mockUnit);
        });

        describe('but the unit does not belong to the active player', () => {
          beforeEach(async () => {
            Unit.belongsToActiveUser.returns(false);
            await makeRequest();
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_doesNotTryToUpdateTheUnit();
          it('fails with 401 unauthorized', () => {
            expectCodeAndText(401, 'belongs to wrong user');
          });
        });

        describe('but the unit does not have any moves remaining', () => {
          beforeEach(async () => {
            mockUnit.movesRemaining = 0;
            await makeRequest();
          });
          afterEach(() => {
            mockUnit.movesRemaining = 2;
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_doesNotTryToUpdateTheUnit();
          it('succeeds with 200', () => {
            expectCodeAndText(200, 'unit already out of moves');
          });
        });

        describe('but the unit is already set to skip turn', () => {
          beforeEach(async () => {
            mockUnit.orders = UNIT_ORDERS.SKIP_TURN;
            await makeRequest();
          });
          afterEach(() => {
            mockUnit.orders = undefined;
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_doesNotTryToUpdateTheUnit();
          it('succeeds with 200', () => {
            expectCodeAndText(200, 'unit already set to skip turn');
          });
        });

        describe('and the update fails', () => {
          beforeEach(async () => {
            Unit.updateOne.yields('fake update error');
            await makeRequest();
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_triesToUpdateTheUnit({orders: UNIT_ORDERS.SKIP_TURN});
          it('fails with 500 and sends the error message', () => {
            expectCodeAndText(500, 'fake update error');
          });
        });

        describe('and the update succeeds', () => {
          beforeEach(async () => {
            Unit.updateOne.yields(null, null);
            await makeRequest();
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_triesToUpdateTheUnit({orders: UNIT_ORDERS.SKIP_TURN});
          it('succeeds with 200', () => {
            expectCodeAndText(200, '');
          });
        });
      });
    });
  });

  describe('post orders/sleep', () => {
    const makeRequest = async () => {
      res = await request(app).post(`/unit/${mockUnitId}/orders/sleep`);
    };

    describe('when there is no active game', () => {
      beforeEach(async () => {
        Session.getCurrentGameId = () => undefined;
        await makeRequest();
      });
      it('does not bother to try to find the unit', () => {
        sinon.assert.notCalled(Unit.findOne);
      });
      it_doesNotTryToUpdateTheUnit();
      it('fails with 401 unauthorized', () => {
        expectCodeAndText(401, 'no active game');
      });
    });

    describe('when there is an active game', () => {
      beforeEach(() => {
        Session.getCurrentGameId = () => mockGame._id;
      });

      describe('when the query throws an error', () => {
        beforeEach(async () => {
          Unit.findOne.yields('fake error message', null);
          await makeRequest();
        });
        it_triesToFindUnitByIdAndActiveGame();
        it_doesNotTryToUpdateTheUnit();
        it('fails with 500 and sends the error message', () => {
          expectCodeAndText(500, 'fake error message');
        });
      });

      describe('when the unit is not found', () => {
        beforeEach(async () => {
          Unit.findOne.yields(null, null);
          await makeRequest();
        });
        it_triesToFindUnitByIdAndActiveGame();
        it_doesNotTryToUpdateTheUnit();
        it('fails with 404 not found', () => {
          expectCodeAndText(404, 'unit not found');
        });
      });

      describe('when the unit is found', () => {
        beforeEach(() => {
          Unit.findOne.yields(null, mockUnit);
        });

        describe('but the unit does not belong to the active player', () => {
          beforeEach(async () => {
            Unit.belongsToActiveUser.returns(false);
            await makeRequest();
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_doesNotTryToUpdateTheUnit();
          it('fails with 401 unauthorized', () => {
            expectCodeAndText(401, 'belongs to wrong user');
          });
        });

        describe('but the unit does not have any moves remaining', () => {
          beforeEach(async () => {
            mockUnit.movesRemaining = 0;
            Unit.updateOne.yields(null, null);
            await makeRequest();
          });
          afterEach(() => {
            mockUnit.movesRemaining = 2;
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_triesToUpdateTheUnit({orders: UNIT_ORDERS.SLEEP});
          it('succeeds with 200', () => {
            expectCodeAndText(200, '');
          });
        });

        describe('but the unit is already sleeping', () => {
          beforeEach(async () => {
            mockUnit.orders = UNIT_ORDERS.SLEEP;
            await makeRequest();
          });
          afterEach(() => {
            mockUnit.orders = undefined;
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_doesNotTryToUpdateTheUnit();
          it('succeeds with 200', () => {
            expectCodeAndText(200, 'unit already sleeping');
          });
        });

        describe('and the update fails', () => {
          beforeEach(async () => {
            Unit.updateOne.yields('fake update error');
            await makeRequest();
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_triesToUpdateTheUnit({orders: UNIT_ORDERS.SLEEP});
          it('fails with 500 and sends the error message', () => {
            expectCodeAndText(500, 'fake update error');
          });
        });

        describe('and the update succeeds', () => {
          beforeEach(async () => {
            Unit.updateOne.yields(null, null);
            await makeRequest();
          });
          it_triesToFindUnitByIdAndActiveGame();
          it_triesToUpdateTheUnit({orders: UNIT_ORDERS.SLEEP});
          it('succeeds with 200', () => {
            expectCodeAndText(200, '');
          });
        });
      });
    });
  });
});
