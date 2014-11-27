var mongo = require('mongodb');
var Server = mongo.Server,
	BSON = mongo.BSONPure,
	Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('quotedb', server, {safe:false});

db.open(function(err, db) {
	console.log( "opening connnection to mongodb");
	if(!err) {
		console.log("Connected to database");
		db.collection('quotes', function(err, collection) {

			collection.indexes(function(err, indexes) {
				console.log("Quotes indexes: " + JSON.stringify(indexes));
			});
			// collection.dropIndexes(function(err, bool) {
			// 	if (bool) 
			// 		console.log('All indexes are dropped');
			// 	else
			// 		console.log('Index drop failed');
			// });

		});
		db.ensureIndex('quotes', {quote:"text", author:"text", description:"text"}, function(err, indexName) {
			console.log("7. index name: " + indexName + err);
		});

		db.ensureIndex('quotes', {quote:1, author:1}, function(err, indexName) {
			console.log("6. index name: " + indexName + err);
		});
	}
});