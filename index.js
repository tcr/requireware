var fs = require('fs')
  , path = require('path')
  , send = require('send')
  , wrench = require("wrench")
  , url = require('url');

function codifyJSON (obj) {
  return JSON.stringify(obj).replace(/\*/g, '\\*').replace(/\//g, '\\/');
}

module.exports = function requireware () {
  var bases = Array.prototype.slice.call(arguments);

  return function (req, res, next) {
    if (req.path.charAt(req.path.length - 1) == '/') {
      if ('source' in req.query) {
        var scripts = {};
        bases.forEach(function (base) {
          var localbase = path.join(base, path.join('/', req.path));
          wrench.readdirSyncRecursive(localbase)
            .forEach(function (filename) {
              var file = path.join(localbase, filename);
              if (fs.statSync(file).isFile()) {
                var localpath = path.join(req.path, filename);
                var scripturl = (req.header('X-Forwarded-Protocol') || 'http') + '://' + req.header('host') + path.join(url.parse(req.originalUrl).pathname, localpath);
                scripts[localpath.replace(/^\//, '')] = '(function () { var exports={}; ' + fs.readFileSync(file, 'utf-8') + '\nreturn exports; })()\n//@ sourceURL=' + scripturl;
              }
            });
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