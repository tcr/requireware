var fs = require('fs')
  , path = require('path')
  , send = require('send')
  , wrench = require("wrench");

function codifyJSON (obj) {
  return JSON.stringify(obj).replace(/\*/g, '\\*').replace(/\//g, '\\/');
}

module.exports = function requireware (base) {
  return function (req, res, next) {
    if (req.path.charAt(req.path.length - 1) == '/') {
      var localbase = path.join(base, path.join('/', req.path));
      if ('source' in req.query) {
        var scripts = {};
        wrench.readdirSyncRecursive(localbase)
          .forEach(function (filename) {
            file = path.join(localbase, filename);
            if (fs.statSync(file).isFile()) {
              scripts[path.join(req.path, filename).replace(/^\//, '')] = '(function () { var exports={}; ' + fs.readFileSync(file, 'utf-8') + '\nreturn exports; })()\n//@ sourceURL=' + file;
            }
          });
        res.setHeader('Content-Type', 'text/javascript');
        res.send('require && (require.content = (' + codifyJSON(scripts) + ')) && require._isReady(' + JSON.stringify(req.path) + ');');
      } else {
        send(req, __dirname + '/static.js').pipe(res);
      }
    } else {
      next();
    }
  }
};