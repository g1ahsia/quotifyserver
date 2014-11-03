var express = require('express').
	quotes = require('./quotes');
var app = express()

app.get('/quotes/:id', quotes.findById);
app.get('/quotes/quoter/:id/:num', quotes.findByQuoterId);
app.get('/quotes/image/:id/:num', quotes.findRecentImagesByQuoterId);
app.get('/quotes/search/:name/:num', quotes.search);
app.get('/quotes/textSearch/:query/:num', quotes.textSearch);
app.get('/quotes', quotes.findAll);
app.get('/quotes/comment/:id', quotes.getCommentsById);
app.post('/quotes', quotes.addQuote);
app.put('/quotes/:id', quotes.updateQuote);
app.put('/quotes/comment/:id', quotes.addComment);
app.delete('/quotes/:id', quotes.deleteQuote);

app.listen(8080);
console.log('Listening on port 8080...');

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});