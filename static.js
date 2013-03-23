(function () {
  function promise () {
    var queue = [], args = null;
    var promise = function (fn) {
      if (promise.delivered) {
        setTimeout(function () {
          fn.apply(null, args);
        });
      } else {
        queue.push(fn);
      }
    }
    promise.deliver = function () {
      args = arguments, promise.delivered = true;
      queue.splice(0, queue.length).forEach(function (fn) {
        setTimeout(function () {
          fn.apply(null, args);
        });
      });
    }
    return promise;
  }

  var require = function (path, pathname, throwErrors) {
    // Normalize relative paths.
    if (pathname) {
      path = path.replace(/^\.\//, pathname.replace(/^\//, '').replace(/\/[^\/]+$/, '') + '/').replace(/\/$/, '');
    }
    
    if (require.exports[path]) {
      return require.exports[path];
    }
    if (require.content[path] == null) {
      if (!path.match(/\.js$/)) {
        return require(path + '.js', pathname, false) || require(path + '/index.js', pathname);
      }
      if (throwErrors === false) {
        return null;
      }
      throw new Error('Error: Cannot find module ' + JSON.stringify(path));
    }

    // Exports object and evaluate.
    require.exports[path] = require.exportsobject = {};
    window.eval(require.content[path] || "null");
    return require.exports[path];
  };
  require.exports = {};
  var onready = promise();
  require._isReady = function () {
    onready.deliver();
  };
  require.ready = function (f) {
    onready(f);
  };
  require.remote = function (src, next) {
    var r = false, s = document.createElement('script');
    s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    s.onload = s.onreadystatechange = function() {
      if ( !r && (!this.readyState || this.readyState == 'complete') ) {
        r = true;
        next();
      }
    };
    document.documentElement.appendChild(s);
  };
  this.require = require;

  // Load sources.
  var els = document.getElementsByTagName('script'), el = els[els.length - 1];
  require.remote(el.src + '?source', onready.deliver);
  // Load inner script content
  var text = el.innerText || '';
  this.require.ready(window.eval('(function () {' + text + '})'));
})();