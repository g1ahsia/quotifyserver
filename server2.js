var express = require('express'),
    quotes = require('./quotes'),
    boards = require('./boards'),
    dailyQuotes = require('./dailyQuotes'),
    collections = require('./collections');
    quoters = require('./quoters'),
    authors = require('./authors'),
    images = require('./images');
 
var app = express();

 
app.listen(3003);
console.log('Listening on port 3003...');

// Starting mongodb
// mongod.exe --config d:\allen\mongodb\mongo.config