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
	{'quote' : '心念思緒平靜，說話心平氣和，行為舉止從容，深具真知灼見，這樣的人全然解脫，極為安詳且智慧具足。',
	 'author' : '《南傳法句經7.9》',
	 'source' : '翻譯自 Acharya Buddharakkhita ｢法句經：佛陀的智慧之路｣(The Dhammapada: The Buddha’s Path of Wisdom)的巴利英譯。',
	 'description' : '',
	 'tags' : ['智慧', '解脫', '平靜', '法句經'],
	 },
 	{'quote' : '良善的人出離一切執著。高尚的人不貪著閒談之樂。智者面對快樂或悲傷際遇，不會得意昂揚或憂鬱消沈。',
	 'author' : '《南傳法句經6.83》',
	 'source' : '翻譯自 Acharya Buddharakkhita ｢法句經：佛陀的智慧之路｣(The Dhammapada: The Buddha’s Path of Wisdom)的巴利英譯。',
	 'description' : '',
	 'tags' : ['良善', '高尚', '智者', '快樂', '悲傷', '憂鬱', '法句經'],
	 },
 	{'quote' : '正如穩固的岩石在暴風雨中毫不動搖，即使蒙受讚譽或譴責，智者不為所動。',
	 'author' : '《南傳法句經6.81》',
	 'source' : '翻譯自 Acharya Buddharakkhita ｢法句經：佛陀的智慧之路｣(The Dhammapada: The Buddha’s Path of Wisdom)的巴利英譯。',
	 'description' : '',
	 'tags' : ['穩固', '讚譽', '譴責', '智者', '法句經'],
	 },
 	{'quote' : '佛陀教導眾人，完全是出於慈悲，因為世尊已全然從貪愛與瞋恨解脫。',
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
var raws_mindfulness = [
	{'quote' : 'Mind precedes all mental states. Mind is their chief; they are all mind-wrought. If with an impure mind a person speaks or acts suffering follows him like the wheel that follows the foot of the ox.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind', 'Mental Development'],
	 },
	{'quote' : 'Mind precedes all mental states. Mind is their chief; they are all mind-wrought. If with a pure mind a person speaks or acts happiness follows him like his never-departing shadow.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind', 'emotion'],
	 },
	{'quote' : 'He abused me, he struck me, he overpowered me, he robbed me." Those who harbor such thoughts do not still their hatred.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind', 'bully'],
	 },
	 {'quote' : 'He abused me, he struck me, he overpowered me, he robbed me." Those who do not harbor such thoughts still their hatred.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['bully'],
	 },
	 {'quote' : 'Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is a law eternal.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind', 'emotion', 'hatred'],
	 },
	 {'quote' : 'There are those who do not realize that one day we all must die. But those who do realize this settle their quarrels.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind', 'fight'],
	 },
	 {'quote' : 'Just as a storm throws down a weak tree, so does Mara overpower the man who lives for the pursuit of pleasures, who is uncontrolled in his senses, immoderate in eating, indolent, and dissipated.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'Just as a storm cannot prevail against a rocky mountain, so Mara can never overpower the man who lives meditating on the impurities, who is controlled in his senses, moderate in eating, and filled with faith and earnest effort.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : [],
	 },
	 {'quote' : 'Whoever being depraved, devoid of self-control and truthfulness, should don the monks yellow robe, he surely is not worthy of the robe.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'But whoever is purged of depravity, well-established in virtues and filled with self-control and truthfulness, he indeed is worthy of the yellow robe.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'Those who mistake the unessential to be essential and the essential to be unessential, dwelling in wrong thoughts, never arrive at the essential.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'Those who know the essential to be essential and the unessential to be unessential, dwelling in right thoughts, do arrive at the essential.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'Just as rain breaks through an ill-thatched house, so passion penetrates an undeveloped mind.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'Just as rain does not break through a well-thatched house, so passion never penetrates a well-developed mind.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'The evil-doer grieves here and hereafter; he grieves in both the worlds. He laments and is afflicted, recollecting his own impure deeds.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'The doer of good rejoices here and hereafter; he rejoices in both the worlds. He rejoices and exults, recollecting his own pure deeds.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'The evil-doer suffers here and hereafter; he suffers in both the worlds. The thought, "Evil have I done," torments him, and he suffers even more when gone to realms of woe.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'The doer of good delights here and hereafter; he delights in both the worlds. The thought, "Good have I done," delights him, and he delights even more when gone to realms of bliss.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'Much though he recites the sacred texts, but acts not accordingly, that heedless man is like a cowherd who only counts the cows of others — he does not partake of the blessings of the holy life.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'Little though he recites the sacred texts, but puts the Teaching into practice, forsaking lust, hatred, and delusion, with true wisdom and emancipated mind, clinging to nothing of this or any other world — he indeed partakes of the blessings of a holy life.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
];

// Execute only once
var insertRaw = function(collection, rawObj) {
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
