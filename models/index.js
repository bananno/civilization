const mongoose = require('mongoose');

const models = {};
module.exports = models;

const modelList = ['City', 'Game', 'Player', 'Tile', 'Unit'];

modelList.forEach(modelName => {
  require('./' + modelName.toLowerCase());
  models[modelName] = mongoose.model(modelName);
});

models.Session = require('./session'); // not a real model
