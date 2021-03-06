process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const router = require('../routes');
const {City, Game, Player, Tile, Unit} = require('../models');

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

const mockTileOrigin = new Tile({
  game: mockGame._id,
  location: [5, 6],
  player: null,
  terrain: {},
});

const mockTileDestination = new Tile({
  game: mockGame._id,
  location: [5, 7],
  player: mockPlayer2._id,
  terrain: {},
});

const mockCity = new City({
  game: mockGame._id,
  player: mockPlayer1._id,
  location: [6, 15],
});

const mockUnit = new Unit({
  game: mockGame._id,
  player: mockPlayer1._id,
  movesRemaining: 2,
  location: [5, 6],
});

const mockRivalUnit = new Unit({
  game: mockGame._id,
  player: mockPlayer2._id,
  movesRemaining: 2,
  location: [5, 12],
});

const app = express()
app.use('/', router);

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
    sinon.stub(Tile, 'update');
    sinon.stub(City, 'find');
    sinon.stub(Unit, 'find');
    sinon.stub(Unit, 'update');

    Game.findById.yields(null, mockGame);
    Player.find.yields(null, [mockPlayer1, mockPlayer2]);
    Tile.find.yields(null, [mockTileOrigin, mockTileDestination]);
    Tile.update.yields(null);
    City.find.yields(null, [mockCity]);
    Unit.find.yields(null, [mockUnit, mockRivalUnit]);
    Unit.update.yields(null);
  });

  afterEach(() => {
    Game.findById.restore();
    Player.find.restore();
    Tile.find.restore();
    Tile.update.restore();
    City.find.restore();
    Unit.find.restore();
    Unit.update.restore();

    mockUnit.templateName = 'scout';
    mockUnit.location = [5, 6];
    mockUnit.movesRemaining = 2;
    mockUnit.player = mockPlayer1._id;
    mockTileOrigin.location = [5, 6];
    mockTileDestination.terrain.water = false;
    mockTileDestination.terrain.mountain = false;
    mockTileDestination.location = [5, 7];
    mockTileDestination.improvement = null;
    mockRivalUnit.location = [5, 12];
    mockCity.location = [6, 15];
    mockCity.player = mockPlayer1._id;
  });

  it('executes', done => {
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.calledOnce(Unit.update);
      })
      .expect(302, done);
  });

  it('fails when the unit has no moves left', done => {
    mockUnit.movesRemaining = 0;
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.notCalled(Unit.update);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Unit has no moves left.');
      })
      .expect(412, done);
  });

  it('fails when the destination tile is off the board', done => {
    mockUnit.location = [0, 5];
    mockTileOrigin.location = [0, 5];
    mockTileDestination.location = [-1, 5];
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.notCalled(Unit.update);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Destination is not a valid location.');
      })
      .expect(412, done);
  });

  it('fails when the destination tile is not adjacent', done => {
    mockTileDestination.location[1] += 5;
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.notCalled(Unit.update);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Destination is not adjacent to origin.');
      })
      .expect(412, done);
  });

  it('executes when the destination tile contains a friendly city', done => {
    mockTileDestination.improvement = 'city';
    mockCity.location = mockTileDestination.location;
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.calledOnce(Unit.update);
      })
      .expect(302, done);
  });

  it('fails when the destination tile contains a rival city', done => {
    mockTileDestination.improvement = 'city';
    mockCity.location = mockTileDestination.location;
    mockCity.player = mockPlayer2._id;
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.notCalled(Unit.update);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Unit cannot enter a rival city.');
      })
      .expect(412, done);
  });

  it('executes when the destination tile is water and the unit is aquatic', done => {
    mockTileDestination.terrain.water = true;
    mockUnit.templateName = 'galley';
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.calledOnce(Unit.update);
      })
      .expect(302, done);
  });

  it('executes when the destination tile contains a city and the unit is aquatic', done => {
    mockTileDestination.improvement = 'city';
    mockUnit.templateName = 'galley';
    mockCity.location = mockTileDestination.location;
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.calledOnce(Unit.update);
      })
      .expect(302, done);
  });

  it('fails when the destination tile is water and the unit is not aquatic', done => {
    mockTileDestination.terrain.water = true;
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.notCalled(Unit.update);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Water tile is impassable.');
      })
      .expect(412, done);
  });

  it('fails when the destination tile is not water and the unit is aquatic', done => {
    mockUnit.templateName = 'galley';
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.notCalled(Unit.update);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Land tile is impassable.');
      })
      .expect(412, done);
  });

  it('fails when the destination tile is a mountain', done => {
    mockTileDestination.terrain.mountain = true;
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.notCalled(Unit.update);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Mountain tile is impassable.');
      })
      .expect(412, done);
  });

  it('fails when there is another unit in the destination tile', done => {
    mockRivalUnit.location = mockTileDestination.location;
    request(app)
      .post('/moveUnit/' + mockUnit._id + '/' + mockTileDestination.location.join('/'))
      .expect(res => {
        sinon.assert.notCalled(Unit.update);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Destination is already occupied by another unit.');
      })
      .expect(412, done);
  });
});
