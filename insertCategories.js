var mongo = require('mongodb');
var winston = require('winston');
var Server = mongo.Server,
	BSON = mongo.BSONPure,
	Db = mongo.Db;
	
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('quotedb', server, {safe:false});

// Init logger
var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console),
		new (winston.transports.File)({filename : 'logs/insertCategory.log'})
	],
	exceptionHandlers: [
		new (winston.transports.File)({filename : 'logs/exceptions.log'}) 
	]
});

db.open(function(err, db) {
	console.log( "opening connnection to mongodb");
	if(!err) {
		console.log("Connected to database");
		// creating indexes
		db.collection('collectionCategories', function(err, collection) {
			for (var i = 0; i < collectionCategories.length; i++) {									
				insertCategory(collection, collectionCategories[i]);
			}
		});
	}
	else {
		console.log("Failed connecting to database");
	}
});

var collectionCategories = [
	{'name' : 'Featured', 'priority' : 1, 'imageID' : '', 'collections' : []},
	{'name' : 'Inspirational', 'priority' : 2, 'imageID' : 'Inspirational_ovn9hf', 'collections' : []},
	{'name' : 'Spiritual', 'priority' : 3, 'imageID' : 'Spiritual_onpihq', 'collections' : []},
	{'name' : 'Love', 'priority' : 4, 'imageID' : 'Love_lhdiq9', 'collections' : []},
	{'name' : 'Poetry', 'priority' : 6, 'imageID' : 'Poetry_caqgd1', 'collections' : []},
	{'name' : 'Life', 'priority' : 5, 'imageID' : 'Life_afvtgt', 'collections' : []},
	{'name' : 'Funny', 'priority' : 7, 'imageID' : 'Funny_faf6mq', 'collections' : []},
	{'name' : 'Celebrities', 'priority' : 8, 'imageID' : '', 'collections' : []},
];

var insertCategory = function(collection, collectionCategory) {
	console.log('inserting', JSON.stringify(collectionCategory));
	collection.findOne({'name' : collectionCategory.name}, function(err, item) {
		console.log('finding');
		// If collection already exists
		if (item) {
			collection.update({'_id': new BSON.ObjectID(item._id)}, {$set : {'priority' : collectionCategory.priority, 'imageID' : collectionCategory.imageID}}, {safe:true}, function(err, result) {
				if (err) {
					logger.error(err);
				} else {
					console.log('' + result + ' document(s) updated with ' + JSON.stringify(result[0]));
				}
			});
		}
		// If collection doesn't exist, add the hashtag
		else {
			collection.insert(collectionCategory, {safe:true}, function(err, result) {
				if (err) {
					logger.error(err);
				} else {
					console.log('' + result + ' document(s) inserted with ' + JSON.stringify(result[0]));
				}
			});
		}
	});
}

