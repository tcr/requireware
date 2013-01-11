var fs = require('fs')
  , path = require('path')
  , send = require('send');

module.exports = function requireware (base) {
  return function (req, res, next) {
    if (req.path.charAt(req.path.length - 1) == '/') {
      if ('source' in req.query) {
        var scripts = {};
        fs.readdirSync(base).forEach(function (file) {
          scripts[file.replace('.js', '')] = '(function () { var exports={}; ' + fs.readFileSync(path.join(base, file), 'utf-8') + '\nreturn exports; })()\n//@ sourceURL=' + file;
        });
        var ObjectBlob = JSON.stringify(scripts).replace(/\*/g, '\\*').replace(/\//g, '\\/');
        res.setHeader('Content-Type', 'text/javascript');
        res.send('require && (require.content = (' + ObjectBlob + ')) && require._isReady(' + JSON.stringify(req.path) + ');');
      } else {
        send(req, __dirname + '/static.js').pipe(res);
      }
    } else {
      next();
    }
  }
};