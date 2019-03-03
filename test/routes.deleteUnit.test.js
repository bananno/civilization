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

describe('Delete unit', function () {
  beforeEach(function() {
    sinon.stub(Unit, 'findByIdAndRemove');
  });

  afterEach(function() {
    Unit.findByIdAndRemove.restore();
  });

  it('is executed when unit has moves remaining', function (done) {
    Unit.findByIdAndRemove.yields(null, {});
    request(app)
      .post('/deleteUnit/' + mockUnit._id)
      .expect(function(res) {
        sinon.assert.calledOnce(Unit.findByIdAndRemove);
      })
    .expect(200, done);
  });
});
