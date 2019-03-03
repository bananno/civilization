process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

const unitRouter = require('../routes/deleteUnit');
const Player = require('../models/player');
const Unit = require('../models/unit');

const mockGame = {
  _id: '9039411cd791f77bcf507f86',
};

const mockPlayer = {
  _id: '507f1f77bcf86cd799439011',
  game: '9039411cd791f77bcf507f86',
};

const mockUnit = {
  _id: '507f1f77bcf86cd799439012',
  game: '9039411cd791f77bcf507f86',
  player: '507f1f77bcf86cd799439011',
  movesRemaining: 2,
};

const app = express()
app.use('/', unitRouter);

//define error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: err
  });
});

describe('Delete unit', () => {
  beforeEach(() => {
    sinon.stub(Unit, 'findByIdAndRemove');
    sinon.stub(Unit, 'findById');
    sinon.stub(Unit, 'find');
  });

  afterEach(() => {
    Unit.findByIdAndRemove.restore();
    Unit.findById.restore();
    Unit.find.restore();
  });

  it('is executed when unit has moves remaining', done => {
    Unit.findByIdAndRemove.yields(null, {});
    Unit.findById.yields(null, mockUnit);

    request(app)
      .post('/deleteUnit/' + mockUnit._id)
      .expect(res => {
        sinon.assert.calledOnce(Unit.findByIdAndRemove);
        sinon.assert.calledOnce(Unit.findById);
      })
    .expect(200, done);
  });

  it('fails if unit has no moves remaining', done => {
    mockUnit.movesRemaining = 0;

    Unit.findByIdAndRemove.yields(null, null);
    Unit.findById.yields(null, mockUnit);

    request(app)
      .post('/deleteUnit/' + mockUnit._id)
      .expect(res => {
        sinon.assert.notCalled(Unit.findByIdAndRemove);
        sinon.assert.calledOnce(Unit.findById);
      })
      .expect(412, done);
  });
});
