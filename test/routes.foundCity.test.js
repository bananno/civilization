process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

const router = require('../routes/foundCity');

const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const City = require('../models/city');
const Unit = require('../models/unit');

const mockGame = {
  _id: '9039411cd791f77bcf507f86',
  mapSize: [20, 10],
  nextPlayer: 0,
};

const mockTile = {
  _id: '07f7f5903941191f7cd7bc86',
  location: [5, 6],
  discovered: [],
  terrain: {},
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
  templateName: 'settler',
  location: [5, 6],
};

const app = express()
app.use('/', router);

//define error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: err
  });
});

describe('Found city', () => {
  beforeEach(() => {
    sinon.stub(Game, 'findById');
    sinon.stub(Player, 'find');
    sinon.stub(Tile, 'find');
    sinon.stub(Tile, 'update');
    sinon.stub(City, 'find');
    sinon.stub(City, 'create');
    sinon.stub(Unit, 'find');
    sinon.stub(Unit, 'deleteOne');

    Game.findById.yields(null, mockGame);
    Player.find.yields(null, [mockPlayer1, mockPlayer2]);
    Tile.find.yields(null, [mockTile]);
    Tile.update.yields(null, {});
    City.find.yields(null, []);
    City.create.yields(null, {});
    Unit.find.yields(null, [mockUnit]);
    Unit.deleteOne.yields(null, {});
  });

  afterEach(() => {
    Game.findById.restore();
    Player.find.restore();
    Tile.find.restore();
    Tile.update.restore();
    City.find.restore();
    City.create.restore();
    Unit.find.restore();
    Unit.deleteOne.restore();

    mockUnit.movesRemaining = 2;
    mockUnit.player = mockPlayer1._id;
    mockUnit.templateName = 'settler';
  });

  it('is executed', done => {
    request(app)
      .post('/foundCity/' + mockUnit._id)
      .expect(res => {
        sinon.assert.calledOnce(City.create);
        sinon.assert.calledOnce(Unit.deleteOne);
      })
      .expect(200, done);
  });

  it('fails if unit has no moves remaining', done => {
    mockUnit.movesRemaining = 0;

    request(app)
      .post('/foundCity/' + mockUnit._id)
      .expect(res => {
        sinon.assert.notCalled(City.create);
        sinon.assert.notCalled(Unit.deleteOne);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Unit has no moves left.');
      })
      .expect(412, done);
  });

  it('fails if current turn player does not own unit', done => {
    mockUnit.player = mockPlayer2._id;

    request(app)
      .post('/foundCity/' + mockUnit._id)
      .expect(res => {
        sinon.assert.notCalled(City.create);
        sinon.assert.notCalled(Unit.deleteOne);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Current player does not own this unit.');
      })
      .expect(412, done);
  });

  it('fails if the unit is not a settler', done => {
    mockUnit.templateName = 'scout';

    request(app)
      .post('/foundCity/' + mockUnit._id)
      .expect(res => {
        sinon.assert.notCalled(City.create);
        sinon.assert.notCalled(Unit.deleteOne);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('This unit is not a settler.');
      })
      .expect(412, done);
  });
});
