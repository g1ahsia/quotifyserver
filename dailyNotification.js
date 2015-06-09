var mongo = require('mongodb');
var Server = mongo.Server,
	BSON = mongo.BSONPure,
	Db = mongo.Db;
var notifications = require('./notifications.js');

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('quotedb', server, {safe:false});

db.open(function(err, db) {
	console.log( "opening connnection to mongodb");
	if(!err) {
		console.log("Connected to database");
	}
	else {
		console.log("Failed connecting to database");
	}
});

// Schedule it at 00:00:00 AM every day
var now = new Date();
var nowInMS = now.getTime();
var nextMorningInMS = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
var timeToNextMorning = nextMorningInMS - nowInMS;
console.log('time now ', now);
console.log('time to next morning ', timeToNextMorning);
setTimeout(function () {schedule()}, timeToNextMorning);

function schedule() {
	scheduleDailyInspiration(); // schedule for today
	setInterval(function () {scheduleDailyInspiration()}, 1000 * 60 * 60 * 24); //schedule for later days
}

function scheduleDailyInspiration() {
	db.collection('quoters', function(err, collection) {
		collection.find().toArray(function(err, quoters) {
			console.log('number of quoters found ', quoters.length);
			quoters.forEach(function (quoterObj) {
				var dailyInspirationTime = quoterObj.dailyInspiration;
				var randomQuoterFollowed = quoterObj.following[Math.floor(Math.random()*quoterObj.following.length)];
				if (randomQuoterFollowed && dailyInspirationTime) {
					findRandomQuoteUntilQuoteFound(quoterObj, randomQuoterFollowed.collections, dailyInspirationTime);
				}
			});
		});
	});
}

var findRandomQuoteUntilQuoteFound = function(quoterObj, collectionIDs, dailyInspirationTime) {
	var randomCollectionID = collectionIDs[Math.floor(Math.random()*collectionIDs.length)];
	db.collection('collections', function(err, col) {
		col.findOne({'_id' : new BSON.ObjectID(randomCollectionID)},function(err, collection) {
			var randomQuoteID = collection.quotes[Math.floor(Math.random()*collection.quotes.length)];
			if (!randomQuoteID) {
				// find again
				findRandomQuoteUntilQuoteFound(quoterObj, collectionIDs, dailyInspirationTime);
			}
			else {
				// quote found
				db.collection('quotes', function(err, col2) {
					col2.findOne({'_id' : new BSON.ObjectID(randomQuoteID)},function(err, quoteObj) {
						var now = new Date();
						var nowInMS = now.getTime();
						var targetInMS = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), dailyInspirationTime.substring(0, 2), dailyInspirationTime.substring(3, 5));
						var timeToUserDailyInspiration = targetInMS - nowInMS;
						console.log('time to fire ', timeToUserDailyInspiration);

						var notificationObj = {};
						notificationObj["quoterID"] = quoterObj._id.toString();
						notificationObj["creationDate"] = new Date();
						notificationObj["event"] = 8;
						notificationObj["targetID"] = quoteObj._id;
						notificationObj["targetContent"] = quoteObj.quote;
						notificationObj["originatorID"] = quoterObj._id.toString();
						notificationObj["originatorName"] = quoterObj.name;
						notificationObj["read"] = 0;

						if (timeToUserDailyInspiration > 0)
							setTimeout(function() {sendNotificationToFollower(notificationObj, quoterObj._id.toString())}, timeToUserDailyInspiration);
					});
				});
			}
		});
	});
}

function sendNotification() {
	console.log('send notification');
}


// Helper method: Pull collection ID from quotes.collections table
var sendNotificationToFollower = function(notificationObj, quoterID) {
	db.collection('notifications', function(err, collection) {
		collection.find({'quoterID' : quoterID, 'read' : 0}).toArray(function(err, unReads) {		
			collection.insert({'quoterID' : quoterID,
							   'originatorID' : notificationObj.originatorID,
							   'originatorName' : notificationObj.originatorName,
							   'creationDate' : notificationObj.creationDate,
							   'event' : notificationObj.event,
							   'read' : notificationObj.read,
							   'targetID' : notificationObj.targetID,
							   'targetContent' : notificationObj.targetContent,
							   'badge' : unReads.length + 1
								}, {safe:true}, function(err, result) {
				if (err) {
					logger.error(err);
				} else {
					console.log('Successfully sent notification: ' + JSON.stringify(result[0]));
					// notifications.send(result[0]);
					sendNotificationToDevices(result[0]);
				}
			});
		});
	});
}

// Helper method: Find all devices associated with quoter to be sent with notificationObj
var sendNotificationToDevices = function(notificationObj) {
	console.log('finding devices of ', notificationObj.quoterID);
	db.collection('devices', function(err, collection) {
		collection.find({'quoterID' :  notificationObj.quoterID}).toArray(function(err, devices) {	
			console.log('devices are ', JSON.stringify(devices));	
			notifications.send(notificationObj, devices);
		});
	});
}