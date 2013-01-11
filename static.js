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

  var require = function (path) {
    return require.exports[path] || (require.exports[path] = window.eval(require.content[path] || "null"));
  }
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
  console.log(el.src);
  require.remote(el.src + '?source', onready.deliver);
  // Load inner script content
  var text = el.innerText || '';
  this.require.ready(window.eval('(function () {' + text + '})'));
})();