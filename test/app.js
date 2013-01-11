var express = require('express')
  , requireware = require('..');

var app = express()

// Artificial delay
/*
app.use(function (req, res, next) {
  if (req.path.match(/^\/scripts/) && 'source' in req.query) {
    setTimeout(next, 3000);
  } else {
    next();
  }
});
*/

app.use('/scripts', requireware(__dirname + '/static/scripts'))
app.use(express.static(__dirname + '/static'));

console.log('http://localhost:3000');
app.listen(3000);