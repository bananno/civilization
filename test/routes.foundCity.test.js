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

/*
Mock data:

  Players:
    Player1 (current turn)
    Player2
  Tiles:
    Tile1 (no owner; has Unit)
    Tile2 (owned by Player2)
    Tile3 (owned by Player1; has City)
  Unit (owned by Player1; on Tile1)
  City (owned by Player1; on Tile3)
*/

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
    Tile.find.yields(null, [mockTile1, mockTile2, mockTile3]);
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
    mockUnit.location = [5, 6];
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

  it('fails if there is already a city in the tile', done => {
    mockUnit.location = mockTile3.location;

    request(app)
      .post('/foundCity/' + mockUnit._id)
      .expect(res => {
        sinon.assert.notCalled(City.create);
        sinon.assert.notCalled(Unit.deleteOne);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Cannot found a city in an existing city tile.');
      })
      .expect(412, done);
  });

  it('fails if the tile is water', done => {
    mockTile1.terrain.water = true;

    request(app)
      .post('/foundCity/' + mockUnit._id)
      .expect(res => {
        sinon.assert.notCalled(City.create);
        sinon.assert.notCalled(Unit.deleteOne);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Cannot found a city in a water tile.');
      })
      .expect(412, done);
  });

  it('fails if the tile is mountain', done => {
    mockTile1.terrain.mountain = true;

    request(app)
      .post('/foundCity/' + mockUnit._id)
      .expect(res => {
        sinon.assert.notCalled(City.create);
        sinon.assert.notCalled(Unit.deleteOne);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Cannot found a city in a mountain tile.');
      })
      .expect(412, done);
  });

  it('is executed if the tile is owned by current player', done => {
    mockTile1.player = mockPlayer1._id;

    request(app)
      .post('/foundCity/' + mockUnit._id)
      .expect(res => {
        sinon.assert.calledOnce(City.create);
        sinon.assert.calledOnce(Unit.deleteOne);
      })
      .expect(200, done);
  });

  it('fails if the tile is owned by another player', done => {
    mockTile1.player = mockPlayer2._id;

    request(app)
      .post('/foundCity/' + mockUnit._id)
      .expect(res => {
        sinon.assert.notCalled(City.create);
        sinon.assert.notCalled(Unit.deleteOne);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Cannot found a city in another player\'s territory.');
      })
      .expect(412, done);
  });
});
