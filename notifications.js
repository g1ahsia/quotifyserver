var apn = require('apn');
var fs = require('fs');
var localizedStrings = require('./localizedStrings');

console.log(localizedStrings.notificationMessage[0]['en']);
/*
Notification events:

0. like a quote
1. requote a quote
2. follow a quoter
3. follow a collection
4. comment on a quote
5. add a new quote to a collection
6. create a new collection
7. send a message (TBD)
8. other notifications (TBD)

*/

var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

// Find collection by ID
exports.findById = function(req, res) {
	var id = req.params.id;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	// Queue.push(dbOperations.performDBOperation("findOne", "quoters", id, null, res));
	Queue.push(dbOperations.performConditionalSearch("findOneConditional", "notifications", id, null, req, res));
	Queue.execute();
};

exports.findAll = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findAll", "notifications", null, null, res));
	Queue.execute();
};

exports.findLatest = function(req, res) {
	var id = req.params.id;
	var num = req.params.num;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findLatest", "notifications", null, {'quoterID' : id, 'num' : num}, res));
	Queue.execute();
};

exports.findNewerNotification = function(req, res) {
	var qtid = req.params.qtid;
	var date = req.params.date;
	var num = req.params.num;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findNewer", "notifications", null, {'quoterID' : qtid, 'creationDate' : date, 'num' : num}, res));
	Queue.execute();
};

exports.findOlderNotification = function(req, res) {
	var qtid = req.params.qtid;
	var date = req.params.date;
	var num = req.params.num;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findOlder", "notifications", null, {'quoterID' : qtid, 'creationDate' : date, 'num' : num}, res));
	Queue.execute();
};

exports.send = function(notificationObj, devices) {
	if (!notificationObj.quoterID) return;
	var id = notificationObj.quoterID;
	var badge = notificationObj.badge;
	var payload = {'originatorID' : notificationObj.originatorID,
					'originatorName' : notificationObj.originatorName,
					'event' : notificationObj.event,
					'creationDate' : notificationObj.creationDate,
					'targetID' : notificationObj.targetID,
					'targetContent' : notificationObj.targetContent,
					'quoterID' : notificationObj.quoterID
					};

	devices.forEach(function (device) {
		var parentFolder = 'devices' + '/' + device.deviceID.substring(32, 34);
		var childFolder = parentFolder + '/' + device.deviceID.substring(34, 36);
		var designatedFile = childFolder + '/' + device.deviceID;
		var message;
		switch(notificationObj.event) {
			case 0: // A liked your quote XYZ
				message = notificationObj.originatorName + ' ' + localizedStrings.notificationMessage[notificationObj.event][device.language] + ' \"' + notificationObj.targetContent + '\"';
				break;
			case 1: // A requoted your quote XYZ to collection ABC
				message = notificationObj.originatorName + ' ' + localizedStrings.notificationMessage[notificationObj.event][device.language] + ' \"' + notificationObj.targetContent[0] + '\" ' + localizedStrings.toCollection + ' \"' + notificationObj.targetContent[1] + '\"';
				break;
			case 2: // A started following you
				message = notificationObj.originatorName + ' ' + localizedStrings.notificationMessage[notificationObj.event][device.language];
				break;
			case 3: // A started following your collection ABC
				message = notificationObj.originatorName + ' ' + localizedStrings.notificationMessage[notificationObj.event][device.language] + ' \"' + notificationObj.targetContent + '\"';
				break;
			case 4: // A commented on your quote XYZ
				message = notificationObj.originatorName + ' ' + localizedStrings.notificationMessage[notificationObj.event][device.language] + ' \"' + notificationObj.targetContent + '\"';
				break;
			case 5: // A added a new quote to colletion ABC
				message = notificationObj.originatorName + ' ' + localizedStrings.notificationMessage[notificationObj.event][device.language] + ' \"' + notificationObj.targetContent[0] + '\" ' + localizedStrings.toCollection + ' \"' + notificationObj.targetContent[1] + '\"';
				break;
			case 6: // A created a new collection ABC
				message = notificationObj.originatorName + ' ' + localizedStrings.notificationMessage[notificationObj.event][device.language] + ' \"' + notificationObj.targetContent + '\"';
				break;
			case 7: // A sent you a message MNO
				message = notificationObj.originatorName + ' ' + localizedStrings.notificationMessage[notificationObj.event][device.language] + ' \"' + notificationObj.targetContent + '\"';
				break;
			case 8: // Daily inspiration sent by the system
				message = localizedStrings.notificationMessage[notificationObj.event][device.language] + ' \"' + notificationObj.targetContent + '\"';
		}

		sendAPNPushNotification(designatedFile, {}, badge, message, payload);
	});
}



// Helper method:
// Send notification to APN with a particular token
var sendAPNPushNotification = function(filePath, options, badge, message, payload) {
	fs.readFile(filePath, function (err, token) {
	  if (err) {
	    console.log(err); 
	  }
	  	console.log('getting token', token.toString());
	  	if (token.toString() == '') {
	  		console.log('no token found');
	  		return;
	  	}
	 	var apnConnection = new apn.Connection(options);
	 	var myDevice = new apn.Device(token.toString());
	 	var note = new apn.Notification();
		note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		note.badge = badge;
		note.sound = "ping.aiff";
		note.alert = message;
		note.payload = payload;

		apnConnection.pushNotification(note, myDevice);

	});
}

exports.update = function(req, res) {
	var id = req.params.id;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performConditionalSearch("updateNotifications", "notifications", id, {$set : {'read' : 1}}, res));
	Queue.execute();
};
