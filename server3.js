var express = require('express'),
	quotes = require('./quotes');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/quotes/:id', quotes.findById);
app.get('/quotes', quotes.findAll);

var server = app.listen(8080, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})