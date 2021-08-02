const express = require('express');
const models = require('../models');
const getVisibleTilesFunction = require('./support/getVisibleTiles');

module.exports = {
  express,
  models,
  ...models,
  getVisibleTilesFunction,
};

const level1files = [
  'createUnit',
  'getData',
  'helpers',
];

const supportFiles  = [
  'chooseAutoResearch',
  'claimTile',
  'getVisibleTiles',
  'workTile',
];

const modelHelpers  = [
  'buildingList',
  'unitList',
  'technologyList',
];

level1files.forEach(filename => {
  module.exports[filename] = require('./' + filename);
});

supportFiles.forEach(filename => {
  module.exports[filename] = require('./support/' + filename);
});

modelHelpers.forEach(filename => {
  module.exports[filename] = require('../models/' + filename);
});

module.exports.UNIT_ORDERS = require('../models/unitOrders');
