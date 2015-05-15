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
	 'tags' : ['mind'],
	 },
	{'quote' : 'He abused me, he struck me, he overpowered me, he robbed me." Those who harbor such thoughts do not still their hatred.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'He abused me, he struck me, he overpowered me, he robbed me." Those who do not harbor such thoughts still their hatred.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is a law eternal.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
	 },
	 {'quote' : 'There are those who do not realize that one day we all must die. But those who do realize this settle their quarrels.',
	 'author' : 'Dhammapada - Pairs',
	 'source' : 'http://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html',
	 'description' : '',
	 'tags' : ['mind'],
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
