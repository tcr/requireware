var fs = require('fs')
  , path = require('path')
  , send = require('send')
  , wrench = require("wrench")
  , url = require('url')
  , UglifyJS = require("uglify-js")
  , Tempfile = require('temporary/lib/file');

function codifyJSON (obj) {
  return JSON.stringify(obj).replace(/\*/g, '\\*').replace(/\//g, '\\/');
}

module.exports = function requireware () {
  var bases = Array.prototype.slice.call(arguments);
  var cache = new Tempfile(), cached = false;

  function refresh (req) {
    var scripts = {};
    bases.forEach(function (base) {
      var localbase = path.join(base, path.join('/', req.path));
      wrench.readdirSyncRecursive(localbase)
        .forEach(function (filename) {
          // Only accept valid filenames ending in .js
          if (!filename.match(/\.js$/)) {
            return;
          }

          var file = path.join(localbase, filename);
          if (fs.statSync(file).isFile()) {
            var localpath = path.join(req.path, filename);
            var scripturl = (req.header('X-Forwarded-Protocol') || 'http') + '://' + req.header('host') + path.join(url.parse(req.originalUrl).pathname, localpath);
            var scriptsrc = fs.readFileSync(file, 'utf-8');

            // Syntax check.
            try {
              UglifyJS.parse(scriptsrc, {filename: localpath});
            } catch (e) {
              scriptsrc = 'throw new SyntaxError(' + codifyJSON(e.message + " at line " + e.line + ", col " + e.col) + ');';
            }
            scripts[localpath.replace(/^\//, '')] = '(function () { var exports={}; ' + scriptsrc  + '\nreturn exports; })()\n//@ sourceURL=' + scripturl;
          }
        });
    });
    cache.writeFileSync('require && (require.content = (' + codifyJSON(scripts) + ')) && require._isReady(' + JSON.stringify(req.path) + ');', 'utf-8');
  }

  return function (req, res, next) {
    if (req.path.charAt(req.path.length - 1) == '/') {
      res.setHeader('Content-Type', 'text/javascript');
      if ('source' in req.query) {
        if (!cached) {
          refresh(req);
          cached = true;
        }
        send(req, cache.path).pipe(res);
      } else {
        send(req, __dirname + '/static.js').pipe(res);
      }
    } else {
      next();
    }
  }
};