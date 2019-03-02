const express = require('express');
const router = express.Router();

router.post('/deleteUnit/:unitId', (req, res, next) => {
  return res.redirect('/');
});

module.exports = router;
