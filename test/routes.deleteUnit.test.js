process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

const unitRouter = require('../routes/deleteUnit');

const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const City = require('../models/city');
const Unit = require('../models/unit');

const mockGame = {
  _id: '9039411cd791f77bcf507f86',
  mapSize: [0, 0],
  nextPlayer: 0,
};

const mockPlayer1 = {
  _id: '507f1f77bcf86cd799439011',
  game: '9039411cd791f77bcf507f86',
  technologies: [],
};

const mockPlayer2 = {
  _id: '95079011d794f1f77bcf86c3',
  game: '9039411cd791f77bcf507f86',
  technologies: [],
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
    sinon.stub(Game, 'findById');
    sinon.stub(Player, 'find');
    sinon.stub(Tile, 'find');
    sinon.stub(City, 'find');
    sinon.stub(Unit, 'find');
    sinon.stub(Unit, 'deleteOne');
  });

  afterEach(() => {
    Game.findById.restore();
    Player.find.restore();
    Tile.find.restore();
    City.find.restore();
    Unit.find.restore();
    Unit.deleteOne.restore();
  });

  it('is executed when unit has moves remaining', done => {
    Game.findById.yields(null, mockGame);
    Player.find.yields(null, [mockPlayer1, mockPlayer2]);
    Tile.find.yields(null, []);
    City.find.yields(null, []);
    Unit.find.yields(null, [mockUnit]);
    Unit.deleteOne.yields(null, {});

    request(app)
      .post('/deleteUnit/' + mockUnit._id)
      .expect(res => {
        sinon.assert.calledOnce(Unit.deleteOne);
      })
    .expect(200, done);
  });

  it('fails if unit has no moves remaining', done => {
    mockUnit.movesRemaining = 0;

    Game.findById.yields(null, mockGame);
    Player.find.yields(null, [mockPlayer1, mockPlayer2]);
    Tile.find.yields(null, []);
    City.find.yields(null, []);
    Unit.find.yields(null, [mockUnit]);
    Unit.deleteOne.yields(null, {});

    request(app)
      .post('/deleteUnit/' + mockUnit._id)
      .expect(res => {
        sinon.assert.notCalled(Unit.deleteOne);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Cannot delete a unit that has no moves left.');
      })
      .expect(412, done);
  });

  it('fails if current turn player does not own unit', done => {
    mockUnit.movesRemaining = 2;
    mockUnit.player = mockPlayer2._id;

    Game.findById.yields(null, mockGame);
    Player.find.yields(null, [mockPlayer1, mockPlayer2]);
    Tile.find.yields(null, []);
    City.find.yields(null, []);
    Unit.find.yields(null, [mockUnit]);
    Unit.deleteOne.yields(null, {});

    request(app)
      .post('/deleteUnit/' + mockUnit._id)
      .expect(res => {
        sinon.assert.notCalled(Unit.deleteOne);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Current player does not own this unit.');
      })
      .expect(412, done);
  });
});
