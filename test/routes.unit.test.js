process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const router = require('../routes');
const {Game, Player, Unit} = require('../models');

const mockGame = new Game({
  mapSize: [10, 20],
  nextPlayer: 0,
});

const mockPlayer1 = new Player({game: mockGame._id});
const mockPlayer2 = new Player({game: mockGame._id});

const mockUnit = new Unit({
  game: mockGame._id,
  player: mockPlayer1._id,
  movesRemaining: 2,
  location: [5, 6],
});
const mockUnitId = `${mockUnit._id}`;

const app = express()
app.use('/', router);

app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: err
  });
});

describe('Unit', () => {
  beforeEach(() => {
    sinon.stub(Unit, 'deleteOne');
    sinon.stub(Unit, 'findById');
  });

  afterEach(() => {
    Unit.deleteOne.restore();
    Unit.findById.restore();
  });

  describe('delete', () => {
    describe('when the query throws an error', () => {
      beforeEach(() => {
        Unit.findById.yields('fake error message', null);
      });
      it('fails with 500 and sends the error message', async () => {
        const res = await request(app).delete(`/unit/${mockUnitId}`);
        sinon.assert.calledWith(Unit.findById, mockUnitId);
        expect(res.statusCode).to.equal(500);
        expect(res.text).to.equal('fake error message');
      });
    });

    describe('when the unit does not exist', () => {
      beforeEach(() => {
        Unit.findById.yields(null, null);
      });
      it('fails with 404 and sends null', async () => {
        const res = await request(app).delete(`/unit/${mockUnitId}`);
        sinon.assert.calledWith(Unit.findById, mockUnitId);
        expect(res.statusCode).to.equal(404);
        expect(res.text).to.equal('');
      });
    });

    describe('when the unit exists', () => {
      describe('and delete fails', () => {
        beforeEach(() => {
          Unit.findById.yields(null, mockUnit);
          Unit.deleteOne.yields('fake deletion error');
        });
        it('fails with 500 and sends the error message', async () => {
          const res = await request(app).delete(`/unit/${mockUnitId}`);
          sinon.assert.calledWith(Unit.findById, mockUnitId);
          sinon.assert.calledWith(Unit.deleteOne, {_id: mockUnitId});
          expect(res.statusCode).to.equal(500);
          expect(res.text).to.equal('fake deletion error');
        });
      });

      describe('and delete succeeds', () => {
        beforeEach(() => {
          Unit.findById.yields(null, mockUnit);
          Unit.deleteOne.yields(null, null);
        });
        it('deletes the unit', async () => {
          const res = await request(app).delete(`/unit/${mockUnitId}`);
          sinon.assert.calledWith(Unit.findById, mockUnitId);
          sinon.assert.calledWith(Unit.deleteOne, {_id: mockUnitId});
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('');
        });
      });
    });
  });
});
