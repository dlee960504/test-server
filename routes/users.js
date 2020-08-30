var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/hoho', function(req, res, next) {
  res.send('hoho');
});

router.get('/haha', function(req, res, next) {
  res.json({name: 'dongryung', age: '25'});
});

module.exports = router;
