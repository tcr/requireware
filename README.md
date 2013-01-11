# requireware

Simple middleware to provide asynchronous require() script loading in the browser.

```javascript
var express = require('express')
  , requireware = require('requireware');

var app = express()

app.use('/scripts', requireware(__dirname + '/static/scripts'))
app.use(express.static(__dirname + '/static'));

console.log('http://localhost:3000');
app.listen(3000);
```

In your page:

```html
<html>
<script src="/scripts">
// An inner script is run after content is asynchronously loaded.

// Load files which add items to `exports`
var EventEmitter = require('events').EventEmitter; 

// Load files which aren't `exports` aware.
require('jquery'); 

// Load remote files with a callback.
require.remote('http://example.com/remotescript.js', function () { /* ... */ })

</script>
<body>
  <h1>Content displayed before scripts are loaded.</h1>
</body>
</html>
```

## License

MIT