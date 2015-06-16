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

// db.open(function(err, db) {
// 	console.log( "opening connnection to mongodb");
// 	if(!err) {
// 		console.log("Connected to database");
// 		// creating indexes
// 		db.collection('imageCategories', function(err, collection) {
// 			for (var i = 0; i < imageCategories.length; i++) {									
// 				insertCategory(collection, imageCategories[i]);
// 			}
// 		});
// 	}
// 	else {
// 		console.log("Failed connecting to database");
// 	}
// });

// Execute only once
var collectionCategories = [
	{'name' : 'Inspirational', 'priority' : 1, 'imageID' : 'Inspirational_ovn9hf', 'collections' : []},
	{'name' : 'Spiritual', 'priority' : 2, 'imageID' : 'Spiritual_onpihq', 'collections' : []},
	{'name' : 'Love', 'priority' : 3, 'imageID' : 'Love_lhdiq9', 'collections' : []},
	{'name' : 'Poetry', 'priority' : 4, 'imageID' : 'Poetry_caqgd1', 'collections' : []},
	{'name' : 'Life', 'priority' : 5, 'imageID' : 'Life_afvtgt', 'collections' : []},
	{'name' : 'Entrepreneurship', 'priority' : 6, 'imageID' : 'Poetry_caqgd1', 'collections' : []},
	{'name' : 'Relationship', 'priority' : 7, 'imageID' : 'Poetry_caqgd1', 'collections' : []},
	{'name' : 'Funny', 'priority' : 8, 'imageID' : 'Funny_faf6mq', 'collections' : []},
	{'name' : 'Others', 'priority' : 9, 'imageID' : 'Funny_faf6mq', 'collections' : []},
];

var imageCategories = [
	{'name' : 'Art', 'priority' : 1, 'imageID' : 'Art_a7sr84', 'collections' : []},
	{'name' : 'Texture and Pattern', 'priority' : 2, 'imageID' : 'Texture_and_Pattern_ajwv0o', 'images' : []},
	{'name' : 'Nature', 'priority' : 3, 'imageID' : 'Nature_tyoxkw', 'images' : []},
	{'name' : 'Sea and Sky', 'priority' : 4, 'imageID' : 'Sea_and_Sky_apfjfq', 'images' : []},
	{'name' : 'People', 'priority' : 6, 'imageID' : 'People_zeyunc', 'images' : []},
	{'name' : 'Flowers', 'priority' : 5, 'imageID' : 'Flowers_plfovh', 'images' : []},
	{'name' : 'Cities', 'priority' : 7, 'imageID' : 'Cities_ovx9lr', 'images' : []},
	{'name' : 'Black and White', 'priority' : 8, 'imageID' : 'Black_and_White_z7fmfj', 'images' : []},
	{'name' : 'Animals', 'priority' : 9, 'imageID' : 'Animals_skzqel', 'images' : []},
	{'name' : 'Other', 'priority' : 10, 'imageID' : 'Other_ovpnhj', 'images' : []},
];

// Execute only once
var insertCategory = function(collection, categories) {
	console.log('inserting', JSON.stringify(categories));
	collection.findOne({'name' : categories.name}, function(err, item) {
		console.log('finding');
		// If collection already exists
		if (item) {
			collection.update({'_id': new BSON.ObjectID(item._id)}, {$set : {'priority' : categories.priority, 'imageID' : categories.imageID}}, {safe:true}, function(err, result) {
				if (err) {
					logger.error(err);
				} else {
					console.log('' + result + ' document(s) updated with ' + JSON.stringify(result[0]));
				}
			});
		}
		// If collection doesn't exist, add the hashtag
		else {
			collection.insert(categories, {safe:true}, function(err, result) {
				if (err) {
					logger.error(err);
				} else {
					console.log('' + result + ' document(s) inserted with ' + JSON.stringify(result[0]));
				}
			});
		}
	});
}

