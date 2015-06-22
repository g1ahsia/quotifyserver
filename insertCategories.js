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
	{'name' : {	'en' : 'Inspirational', 
               	'zh-Hant' : '啟發'}, 'priority' : 1, 'imageID' : 'Inspirational_ovn9hf'},
	{'name' : {	'en' : 'Spiritual', 
			 	'zh-Hant' : '靈性'}, 'priority' : 2, 'imageID' : 'Spiritual_onpihq'},
	{'name' : {	'en' : 'Love & Compassion',
				'zh-Hant' : '愛與慈悲'}, 'priority' : 3, 'imageID' : 'Love_lhdiq9'},
	{'name' : { 'en' : 'Poetry',
				 'zh-Hant' : '詩詞'}, 'priority' : 4, 'imageID' : 'Poetry_caqgd1'},
	{'name' : {	'en' : 'Life', 
				'zh-Hant' : '生活'}, 'priority' : 5, 'imageID' : 'Life_afvtgt'},
	{'name' : {	'en' : 'Entrepreneurship',
				'zh-Hant' : '創業精神'}, 'priority' : 6, 'imageID' : 'Poetry_caqgd1'},
	{'name' : { 'en' : 'Relationship',
				'zh-Hant' : '人際關係'}, 'priority' : 7, 'imageID' : 'Poetry_caqgd1'},
	{'name' : {	'en' : 'Funny',
				'zh-Hant' : '有趣'}, 'priority' : 8, 'imageID' : 'Funny_faf6mq'},
	{'name' : {	'en' : 'Motivational',
				'zh-Hant' : '勵志'}, 'priority' : 9, 'imageID' : 'Funny_faf6mq'},
];

var imageCategories = [
	{'name' : {	'en' : 'Art', 
               	'zh-Hant' : '藝術'}, 'priority' : 1, 'imageID' : 'Art_a7sr84', 'collections' : []},
	{'name' : {	'en' : 'Texture', 
               	'zh-Hant' : '紋路'}, 'priority' : 2, 'imageID' : 'Texture_and_Pattern_ajwv0o', 'images' : []},
	{'name' : {	'en' : 'Nature', 
               	'zh-Hant' : '自然'}, 'priority' : 3, 'imageID' : 'Nature_tyoxkw', 'images' : []},
	{'name' : {	'en' : 'Sea & Sky', 
               	'zh-Hant' : '海與天'}, 'priority' : 4, 'imageID' : 'Sea_and_Sky_apfjfq', 'images' : []},
	{'name' : {	'en' : 'People', 
               	'zh-Hant' : '人物'}, 'priority' : 6, 'imageID' : 'People_zeyunc', 'images' : []},
	{'name' : {	'en' : 'Flowers', 
               	'zh-Hant' : '花朵'}, 'priority' : 5, 'imageID' : 'Flowers_plfovh', 'images' : []},
	{'name' : {	'en' : 'Cities', 
               	'zh-Hant' : '城市'}, 'priority' : 7, 'imageID' : 'Cities_ovx9lr', 'images' : []},
	{'name' : {	'en' : 'Black and White', 
               	'zh-Hant' : '黑與白'}, 'priority' : 8, 'imageID' : 'Black_and_White_z7fmfj', 'images' : []},
	{'name' : {	'en' : 'Animals', 
               	'zh-Hant' : '動物'}, 'priority' : 9, 'imageID' : 'Animals_skzqel', 'images' : []},
	{'name' : {	'en' : 'Others', 
               	'zh-Hant' : '其他'}, 'priority' : 10, 'imageID' : 'Other_ovpnhj', 'images' : []},
];

// Execute only once
var insertCategory = function(collection, categories) {
	console.log('inserting', JSON.stringify(categories));
	// Insert or update based on English name
	collection.findOne({'name.en' : categories.name.en}, function(err, item) {
		console.log('finding');
		// If collection already exists
		if (item) {
			collection.update({'_id': new BSON.ObjectID(item._id)}, {$set : {'name' : categories.name, 'priority' : categories.priority, 'imageID' : categories.imageID}}, {safe:true}, function(err, result) {
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