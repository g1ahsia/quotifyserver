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

// db.open(function(err, db) {
// 	console.log( "opening connnection to mongodb");
// 	if(!err) {
// 		console.log("Connected to database");
// 		// creating indexes
// 		db.collection('collectionCategories', function(err, collection) {
// 			for (var i = 0; i < collectionCategories.length; i++) {									
// 				insertCategory(collection, collectionCategories[i]);
// 			}
// 		});
// 	}
// 	else {
// 		console.log("Failed connecting to database");
// 	}
// });

db.open(function(err, db) {
	console.log( "opening connnection to mongodb");
	if(!err) {
		console.log("Connected to database");
		// creating indexes
		db.collection('imageCategories', function(err, collection) {
			for (var i = 0; i < imageCategories.length; i++) {									
				insertCategory(collection, imageCategories[i]);
			}
		});
	}
	else {
		console.log("Failed connecting to database");
	}
});

// Execute only once
var collectionCategories = [
	// English
	{'name' : 'Inspirational', 'language' : 'en', 'priority' : 2, 'imageID' : 'Inspirational_ovn9hf', 'collections' : []},
	{'name' : 'Spiritual', 'language' : 'en', 'priority' : 3, 'imageID' : 'Spiritual_onpihq', 'collections' : []},
	{'name' : 'Love', 'language' : 'en', 'priority' : 4, 'imageID' : 'Love_lhdiq9', 'collections' : []},
	{'name' : 'Poetry', 'language' : 'en', 'priority' : 6, 'imageID' : 'Poetry_caqgd1', 'collections' : []},
	{'name' : 'Life', 'language' : 'en', 'priority' : 5, 'imageID' : 'Life_afvtgt', 'collections' : []},
	{'name' : 'Funny', 'language' : 'en', 'priority' : 7, 'imageID' : 'Funny_faf6mq', 'collections' : []},
	{'name' : 'Authors', 'language' : 'en', 'priority' : 8, 'imageID' : '', 'collections' : []},
	// 中文
	{'name' : '啟發', 'language' : 'zh_Hant', 'priority' : 2, 'imageID' : 'Inspirational_ovn9hf', 'collections' : []},
	{'name' : '靈性', 'language' : 'zh_Hant', 'priority' : 3, 'imageID' : 'Spiritual_onpihq', 'collections' : []},
	{'name' : '愛', 'language' : 'zh_Hant', 'priority' : 4, 'imageID' : 'Love_lhdiq9', 'collections' : []},
	{'name' : '詩詞', 'language' : 'zh_Hant', 'priority' : 6, 'imageID' : 'Poetry_caqgd1', 'collections' : []},
	{'name' : '生命', 'language' : 'zh_Hant', 'priority' : 5, 'imageID' : 'Life_afvtgt', 'collections' : []},
	{'name' : '有趣', 'language' : 'zh_Hant', 'priority' : 7, 'imageID' : 'Funny_faf6mq', 'collections' : []},
	{'name' : '作者', 'language' : 'zh_Hant', 'priority' : 8, 'imageID' : '', 'collections' : []},
];

var imageCategories = [
	// English
	{'name' : 'Art', 'language' : 'en', 'priority' : 1, 'imageID' : 'Art_a7sr84', 'collections' : []},
	{'name' : 'Texture and Pattern', 'language' : 'en', 'priority' : 2, 'imageID' : 'Texture_and_Pattern_ajwv0o', 'images' : []},
	{'name' : 'Nature', 'language' : 'en', 'priority' : 3, 'imageID' : 'Nature_tyoxkw', 'images' : []},
	{'name' : 'Sea and Sky', 'language' : 'en', 'priority' : 4, 'imageID' : 'Sea_and_Sky_apfjfq', 'images' : []},
	{'name' : 'People', 'language' : 'en', 'priority' : 6, 'imageID' : 'People_zeyunc', 'images' : []},
	{'name' : 'Flowers', 'language' : 'en', 'priority' : 5, 'imageID' : 'Flowers_plfovh', 'images' : []},
	{'name' : 'Cities', 'language' : 'en', 'priority' : 7, 'imageID' : 'Cities_ovx9lr', 'images' : []},
	{'name' : 'Black and White', 'language' : 'en', 'priority' : 8, 'imageID' : 'Black_and_White_z7fmfj', 'images' : []},
	{'name' : 'Animals', 'language' : 'en', 'priority' : 9, 'imageID' : 'Animals_skzqel', 'images' : []},
	{'name' : 'Other', 'language' : 'en', 'priority' : 10, 'imageID' : 'Other_ovpnhj', 'images' : []},
	// 中文
	{'name' : '藝術', 'language' : 'zh_Hant', 'priority' : 1, 'imageID' : 'Art_a7sr84', 'collections' : []},
	{'name' : '紋路和圖樣', 'language' : 'zh_Hant', 'priority' : 2, 'imageID' : 'Texture_and_Pattern_ajwv0o', 'images' : []},
	{'name' : '自然', 'language' : 'zh_Hant', 'priority' : 3, 'imageID' : 'Nature_tyoxkw', 'images' : []},
	{'name' : '海與天', 'language' : 'zh_Hant', 'priority' : 4, 'imageID' : 'Sea_and_Sky_apfjfq', 'images' : []},
	{'name' : '人物', 'language' : 'zh_Hant', 'priority' : 6, 'imageID' : 'People_zeyunc', 'images' : []},
	{'name' : '花朵', 'language' : 'zh_Hant', 'priority' : 5, 'imageID' : 'Flowers_plfovh', 'images' : []},
	{'name' : '城市', 'language' : 'zh_Hant', 'priority' : 7, 'imageID' : 'Cities_ovx9lr', 'images' : []},
	{'name' : '黑與白', 'language' : 'zh_Hant', 'priority' : 8, 'imageID' : 'Black_and_White_z7fmfj', 'images' : []},
	{'name' : '動物', 'language' : 'zh_Hant', 'priority' : 9, 'imageID' : 'Animals_skzqel', 'images' : []},
	{'name' : '其他', 'language' : 'zh_Hant', 'priority' : 10, 'imageID' : 'Other_ovpnhj', 'images' : []},

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

