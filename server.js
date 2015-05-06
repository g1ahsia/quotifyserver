var express = require('express'),
	  // queries = require('./queries'),
	  quotes = require('./quotes'),
	  boards = require('./boards'),
	  dailyQuotes = require('./dailyQuotes'),
	  collections = require('./collections'),
	  quoters = require('./quoters'),
	  authors = require('./authors'),
	  images = require('./images'),
	  devices = require('./devices'),
	  notifications = require('./notifications'),
	  categories = require('./categories'),
	  tags = require('./tags');
var app = express();

app.get('/quoters/:id', quoters.findById);
app.get('/quoters/email/:email', quoters.findByEmail);
app.get('/quoters/search/:name/:num', quoters.search);
app.get('/quoters/textSearch/:name/:num', quoters.textSearch);
app.get('/quoters', quoters.findAll);
app.post('/quoters/login/', quoters.loginQuoter);
app.post('/quoters', quoters.addQuoter);
app.put('/quoters/:id', quoters.updateQuoter);
app.put('/quoters/like/:id', quoters.likeQuote);
app.put('/quoters/unlike/:id', quoters.unlikeQuote);
app.put('/quoters/requote/:id', quoters.requoteQuote);
app.put('/quoters/favorite/:id', quoters.chooseFavorite);
app.get('/quoters/recommend/:num', quoters.findRecommended);
app.put('/quoters/follow/:id', quoters.followQuoter);
app.put('/quoters/unfollow/:id', quoters.unfollowQuoter);
app.delete('/quoters/:id', quoters.invalidateQuoter);

// app.get('/queries/history/:query/:num', queries.history);
// app.get('/queries/quoter/:id/:num', queries.quoter);
app.get('/quotes/:id', quotes.findById);
app.get('/quotes/quoter/:id/:num', quotes.findByQuoterId);
app.get('/quotes/image/:id/:num', quotes.findRecentImagesByQuoterId);
app.get('/quotes/search/:query/:num', quotes.textSearch);
app.get('/quotes/textSearch/:query/:num', quotes.textSearch);
app.get('/quotes', quotes.findAll);
app.get('/quotes/comment/:id', quotes.getCommentsById);
app.post('/quotes', quotes.addQuote);
app.put('/quotes/:id', quotes.updateQuote);
app.put('/quotes/comment/:id', quotes.addComment);
app.delete('/quotes', quotes.deleteQuote);

app.get('/collections/:id', collections.findById);
app.get('/collections/search/:query/:num', collections.search);
app.get('/collections/textSearch/:query/:num', collections.textSearch);
app.get('/collections', collections.findAll);
app.get('/collections/category/:category', collections.findByCategory);
app.post('/collections', collections.addCollection);
app.put('/collections/:id', collections.updateCollection);
app.put('/collections/chooseCover/:id', collections.chooseCover);
app.put('/collections/follow/:id', collections.followCollection);
app.put('/collections/unfollow/:id', collections.unfollowCollection);
app.delete('/collections', collections.deleteCollection);

app.get('/authors/:id', authors.findById);
app.get('/authors', authors.findAll);
app.get('/authors/search/:name/:num', authors.search);

app.get('/boards/:id', boards.findById);
app.get('/boards', boards.findAll);
app.get('/boards/latest/quoter/:id/:num', boards.findLatest); // version 3.0
app.get('/boards/newer/quoter/:qtid/:date/:num', boards.findNewerBoard); // version 3.0
app.get('/boards/older/quoter/:qtid/:date/:num', boards.findOlderBoard); // version 3.0
// app.get('/boards/quoter/:id/:num', boards.findLatestBoard); version 2.0
// app.get('/boards/quoter/newer/:qtid/:qid/:num', boards.findNewer); // version 2.0
// app.get('/boards/quoter/older/:qtid/:qid/:num', boards.findOlder);  // version 2.0
app.post('/boards/quoter/:qtid', boards.addQuote);

app.get('/dailyQuotes/:id', dailyQuotes.findById);
app.get('/dailyQuotes', dailyQuotes.findAll);
app.get('/dailyQuotes/latest/:num', dailyQuotes.findLatestPopular);

app.get('/images/:id', images.findImageById);
app.get('/images', images.findAll);
app.get('/images/category/:category', images.findByCategory);
app.get('/images/search/:query/:num', images.search);
app.get('/images/textSearch/:query/:num', images.textSearch);
app.get('/images/metadata/:id', images.findById);
app.post('/images', images.addImage);
app.post('/images/insert', images.insertImageManually);
app.get('/thumbnails/:id', images.findThumbnailById);
app.get('/avatars/:id', images.findAvatarById);
app.get('/imageForm', images.imageForm);
app.put('/images/:id', images.updateImageTags);
app.get('/images/cloudinaryRequest/:publicId', images.cloudinaryRequest);

app.get('/devices', devices.findAll);
app.post('/devices/:id/:UUID', devices.addDevice);
app.put('/devices/unlink/:UUID', devices.unlinkDevice);

app.get('/notifications/:id', notifications.findById);
app.get('/notifications/quoter/:id/:num', notifications.findLatest); 
app.get('/notifications/newer/quoter/:qtid/:date/:num', notifications.findNewerNotification);
app.get('/notifications/older/quoter/:qtid/:date/:num', notifications.findOlderNotification); 
app.get('/notifications', notifications.findAll);
app.put('/notifications/update/:id', notifications.update);

app.get('/tags', tags.findAll);
app.get('/tags/hashtag/:tag', tags.findByHashtag);

app.get('/categories/collection', categories.findAllCollectionCategories);
app.get('/categories/image', categories.findAllImageCategories);

 
app.listen(8080);
console.log('Listening on port 8080...');

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});


// Starting mongodb
// mongod.exe --config d:\allen\mongodb\mongo.config
