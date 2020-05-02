process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const sinon = require('sinon');
const supertest = require('supertest');
const express = require('express');
const bodyParser = require('body-parser')
const router = require('../routes');
const {Game} = require('../models');

const zoomLimit = [1, 3];

const mockGame = new Game({
  nextPlayer: 0,
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', router);

app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: err
  });
});

describe('Zoom', () => {
  beforeEach(() => {
    sinon.stub(Game, 'findById');
    sinon.stub(Game, 'update');
    Game.update.yields(null);
  });

  afterEach(() => {
    Game.findById.restore();
    Game.update.restore();
  });

  it('fails when input is not 1 or -1', done => {
    Game.findById.yields(null, { zoom: 1 });

    supertest(app)
      .post('/zoom/')
      .send({direction: 2})
      .expect(res => {
        sinon.assert.notCalled(Game.findById);
        sinon.assert.notCalled(Game.update);
        const errorMsg = JSON.parse(res.error.text).message;
        expect(errorMsg).to.equal('Invalid zoom input.');
      })
      .expect(412, done);
  });

  describe('Zoom in', () => {
    it('executes when current zoom is less than ' + zoomLimit[1], done => {
      Game.findById.yields(null, { zoom: zoomLimit[1] - 1 });

      supertest(app)
        .post('/zoom/')
        .send({direction: 1})
        .expect(res => {
          sinon.assert.calledOnce(Game.findById);
          sinon.assert.calledOnce(Game.update);
        })
        .expect(200, done);
    });

    it('fails when current zoom is not less than ' + zoomLimit[1], done => {
      Game.findById.yields(null, { zoom: zoomLimit[1] });

      supertest(app)
        .post('/zoom/')
        .send({direction: 1})
        .expect(res => {
          sinon.assert.calledOnce(Game.findById);
          sinon.assert.notCalled(Game.update);
          const errorMsg = JSON.parse(res.error.text).message;
          expect(errorMsg).to.equal('Zoom is out of range.');
        })
        .expect(412, done);
    });
  });

  describe('Zoom out', () => {
    it('executes when current zoom is greater than ' + zoomLimit[0], done => {
      Game.findById.yields(null, { zoom: zoomLimit[0] + 1 });

      supertest(app)
        .post('/zoom/')
        .send({direction: 0})
        .expect(res => {
          sinon.assert.calledOnce(Game.findById);
          sinon.assert.calledOnce(Game.update);
        })
        .expect(200, done);
    });

    it('fails when current zoom is not greater than ' + zoomLimit[0], done => {
      Game.findById.yields(null, { zoom: zoomLimit[0] });

      supertest(app)
        .post('/zoom/')
        .send({direction: 0})
        .expect(res => {
          sinon.assert.calledOnce(Game.findById);
          sinon.assert.notCalled(Game.update);
          const errorMsg = JSON.parse(res.error.text).message;
          expect(errorMsg).to.equal('Zoom is out of range.');
        })
        .expect(412, done);
    });
  });
});
