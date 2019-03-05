process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

const router = require('../routes/moveUnit');

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
  terrain: {},
});

const mockTile2 = new Tile({
  game: mockGame._id,
  location: [3, 12],
  player: mockPlayer2._id,
  terrain: {},
});

const mockTile3 = new Tile({
  game: mockGame._id,
  location: [2, 2],
  player: mockPlayer1._id,
  terrain: {},
  improvement: 'city',
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

describe('Move unit', () => {
  beforeEach(() => {
    sinon.stub(Game, 'findById');
    sinon.stub(Player, 'find');
    sinon.stub(Tile, 'find');
    sinon.stub(City, 'find');
    sinon.stub(Unit, 'find');
    sinon.stub(Unit, 'update');

    Game.findById.yields(null, mockGame);
    Player.find.yields(null, [mockPlayer1, mockPlayer2]);
    Tile.find.yields(null, [mockTile1, mockTile2, mockTile3]);
    City.find.yields(null, [mockCity]);
    Unit.find.yields(null, [mockUnit]);
    Unit.update.yields(null);
  });

  afterEach(() => {
    Game.findById.restore();
    Player.find.restore();
    Tile.find.restore();
    City.find.restore();
    Unit.find.restore();
    Unit.update.restore();

    mockUnit.movesRemaining = 2;
    mockUnit.player = mockPlayer1._id;
    mockUnit.templateName = 'settler';
    mockTile1.player = null;
    mockTile1.terrain.water = false;
    mockTile1.terrain.mountain = false;
    mockUnit.location = [5, 6];
  });

  it('is executed', done => {
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/0/0')
      .expect(res => {
        sinon.assert.calledOnce(Unit.update);
      })
      .expect(302, done);
  });
});
