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
 	{'topic' : 'Emotion',
	 'tags' : ['sadness', 'happiness', 'despair', 'lust', 'hatred'];	
	 },
 	{'topic' : 'Love',
	 'tags' : ['compassion', '']
	 'source' : '翻譯自 Acharya Buddharakkhita ｢法句經：佛陀的智慧之路｣(The Dhammapada: The Buddha’s Path of Wisdom)的巴利英譯。',
	 'description' : '',
	 'tags' : ['穩固', '讚譽', '譴責', '智者', '法句經'],
	 },
 	{'topic' : 'Wisdom',
	 'author' : '《相應部 1.150》',
	 'source' : '翻譯自Ven. S. Dhammika ｢正法寶石｣("Gemstones of the Good Dhammas")的巴利英譯。',
	 'description' : '',
	 'tags' : ['貪愛', '瞋恨', '解脫', '慈悲', '佛陀'],
	 },
	 {'quote' : '尋法者如找不到勝於己或與己相等的人同行，那就毅然獨自追尋真理；也不應與愚者同行。',
	 'author' : '《南傳法句經 5.61》',
	 'source' : '翻譯自 Acharya Buddharakkhita ｢法句經：佛陀的智慧之路｣(The Dhammapada: The Buddha’s Path of Wisdom)的巴利英譯。',
	 'description' : '',
	 'tags' : ['真理', '愚者', '法句經'],
	 },
	 {'quote' : '在世上所有的芳香之中 --檀香、多迦羅、藍色蓮花和茉莉 –德行乃是最勝的芳香。',
	 'author' : '《南傳法句經 4.55》',
	 'source' : '翻譯自 Acharya Buddharakkhita ｢法句經：佛陀的智慧之路｣(The Dhammapada: The Buddha’s Path of Wisdom)的巴利英譯。',
	 'description' : '',
	 'tags' : ['芳香', '德行', '法句經'],
	 },
	 {'quote' : '口出惡言的愚人以為贏得勝利，然而懂得寬容才是致勝關鍵。',
	 'author' : '《相應部 1.189》',
	 'source' : '翻譯自Ven. S. Dhammika ｢正法寶石｣("Gemstones of the Good Dhammas")的巴利英譯。',
	 'description' : '',
	 'tags' : ['愚人', '寬容', '致勝', '勝利','惡言'],
	 },
	 {'quote' : '起來！別忘失正念！過正當生活。這樣的人此生和來生得享快樂。',
	 'author' : '《南傳法句經 13.168》',
	 'source' : '翻譯自 Acharya Buddharakkhita ｢法句經：佛陀的智慧之路｣的巴利英譯。',
	 'description' : '',
	 'tags' : ['正念', '生活', '快樂', '法句經'],
	 },
	 {'quote' : '雖然過著富裕生活，卻不奉養年邁雙親—這是讓人窮困的原因。',
	 'author' : '《經集 1.98》',
	 'source' : '翻譯自 Narada Thera ｢人人適用的倫理道德：佛陀的四個開示｣的巴利英譯。',
	 'description' : '',
	 'tags' : ['富裕', '年邁', '窮困'],
	 },
	 {'quote' : '智者守護身、語、意。他們的思想言行毫不放逸。',
	 'author' : '《南傳法句經 17.234》',
	 'source' : '翻譯自 Acharya Buddharakkhita ｢法句經：佛陀的智慧之路｣的巴利英譯。',
	 'description' : '',
	 'tags' : ['身語意', '思想', '放逸', '法句經'],
	 },
	 {'quote' : '身寂靜，語寂靜，心寂靜，無雜染，聖者恆享寂靜。這樣的人是真清淨。',
	 'author' : '《如是語經 3.67》',
	 'source' : '翻譯自Ven. S. Dhammika ｢正法寶石｣("Gemstones of the Good Dhammas")的巴利英譯。',
	 'description' : '',
	 'tags' : ['寂靜', '清淨'],
	 },
	 {'quote' : '願提防惡念；願謹慎思惟。摒棄惡念，願常懷善念。',
	 'author' : '《南傳法句經 17.233》',
	 'source' : '翻譯自 Acharya Buddharakkhita ｢法句經：佛陀的智慧之路｣(The Dhammapada: The Buddha\'s Path of Wisdom)的巴利英譯。',
	 'description' : '',
	 'tags' : ['惡念', '善念', '法句經'],
	 }
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
