const expect = require('chai').expect;
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

var unitRouter = require('../routes/deleteUnit');
var Player = require('../models/player');
var Unit = require('../models/unit');

var mockPlayer = {
  _id: '507f1f77bcf86cd799439011',
};

var mockUnit = {
  _id: '507f1f77bcf86cd799439012',
  player: '507f1f77bcf86cd799439011',
};

var app = express()
app.use('/', unitRouter);

//define error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: err
  });
});

describe('Unit router ', function() {
  beforeEach(function() {
    sinon.stub(Unit, 'find');
    sinon.stub(Unit, 'findById');
  });

  afterEach(function() {
    Unit.find.restore();
    Unit.findById.restore();
  });

  it('returns unit object array on GET /units', function (done) {
    var expectedResult = [ mockUnit ];
    Unit.find.yields(null, expectedResult);
    request(app)
      .get('/units')
      .expect(function (res) {
        expect(res.body).to.be.an('array');
      })
      .expect(200, done);
  });
});

describe('Delete user', function () {
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
