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
		db.collection('raws', function(err, collection) {
			for (var i = 0; i < raws.length; i++) {									
				insertRaw(collection, raws[i]);
			}
		});
	}
	else {
		console.log("Failed connecting to database");
	}
});

var raws = [
	{'topic' : 'Spiritual',
	 'tags' : ['mind', 'mental development', 'craving', ''];	
	 },
 	{'topic' : 'Motivational',
	 'tags' : ['mind', 'happiness', 'despair', 'lust', 'hatred'];	
	 },
 	{'topic' : 'Love',
	 'tags' : ['compassion', '']
	 },
 	{'topic' : 'Wisdom',
	 'tags' : ['貪愛', '瞋恨', '解脫', '慈悲', '佛陀'],
	 },
 	{'topic' : 'Emotion',
	 'tags' : ['sadness', 'happiness', 'despair', 'lust', 'hatred'];	
	 },
	 //May 07, 2015
];

// Execute only once
var insertTopic = function(collection, rawObj) {
	console.log('inserting', JSON.stringify(rawObj));
	collection.findOne({'quote' : rawObj.quote}, function(err, item) {
		// If collection already exists
		if (item) {
				collection.update({'_id': new BSON.ObjectID(item._id)}, {$set : {'quote' : rawObj.quote, 'author' : rawObj.author, 'source' : rawObj.source, 'description' : rawObj.description, 'tags' : rawObj.tags}}, {safe:true}, function(err, result) {
				if (err) {
					logger.error(err);
				} else {
					console.log('' + result + ' document(s) updated with ' + JSON.stringify(result[0]));
				}
			});
		}
		// If collection doesn't exist, add the hashtag
		else {
			require('cld').detect(rawObj["quote"], function(err, result) {
				console.log('detected language is' + result["languages"][0]["code"]);
				rawObj["detectedLanguage"] = result["languages"][0]["code"];
			});
			collection.insert(rawObj, {safe:true}, function(err, result) {
				if (err) {
					logger.error(err);
				} else {
					console.log('' + result + ' document(s) inserted with ' + JSON.stringify(result[0]));
				}
			});
		}
	});
}
