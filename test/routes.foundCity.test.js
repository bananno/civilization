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

const mockGame = new Game({
  mapSize: [10, 20],
  nextPlayer: 0,
});

const mockPlayer1 = new Player({
  game: mockGame._id,
});

const mockPlayer2 = new Player({
  game: mockGame._id,
});

const mockTile1 = new Tile({
  game: mockGame._id,
  location: [5, 6],
  player: null,
});

const mockTile2 = new Tile({
  game: mockGame._id,
  location: [3, 12],
  player: mockPlayer2._id,
});

const mockTile3 = new Tile({
  game: mockGame._id,
  location: [2, 2],
  player: mockPlayer1._id,
});

const mockCity = new City({
  game: mockGame._id,
  player: mockPlayer1._id,
  location: mockTile3.location,
});

const mockUnit = new Unit({
  game: mockGame._id,
  player: mockPlayer1._id,
  movesRemaining: 2,
  templateName: 'settler',
  location: [5, 6],
});

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
    Tile.find.yields(null, [mockTile1, mockTile2]);
    Tile.update.yields(null, {});
    City.find.yields(null, [mockCity]);
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
    mockTile1.player = null;
    mockTile1.terrain.water = false;
    mockTile1.terrain.mountain = false;
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
