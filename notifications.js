var apn = require('apn');
var fs = require('fs');

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
	var message;
	console.log('quoter to be sent is ', notificationObj.quoterID);
	switch(notificationObj.event) {
		case 0:
			message = notificationObj.originatorName + ' liked your quote \"' + notificationObj.targetContent + '\"';
			break;
		case 1:
			message = notificationObj.originatorName + ' requoted your quote \"' + notificationObj.targetContent[0] + '\" to collection \"' + notificationObj.targetContent[1] + '\"';
			break;
		case 2:
			message = notificationObj.originatorName + ' started following you.';
			break;
		case 3:
			message = notificationObj.originatorName + ' started following your collection \"' + notificationObj.targetContent + '\"';
			break;
		case 4:
			message = notificationObj.originatorName + ' commented on your quote \"' + notificationObj.targetContent + '\"';
			break;
		case 5:
			message = notificationObj.originatorName + ' added a new quote \"' + notificationObj.targetContent[0] + '\" in collection \"' + notificationObj.targetContent[1] + '\"';
			break;
		case 6:
			message = notificationObj.originatorName + ' created a new collection \"' + notificationObj.targetContent + '\"';
			break;
		case 7:
			message = notificationObj.originatorName + ' sent you a message \"' + notificationObj.targetContent + '\"';
			break;
	}
	var payload = {'originatorID' : notificationObj.originatorID,
					'originatorName' : notificationObj.originatorName,
					'event' : notificationObj.event,
					'creationDate' : notificationObj.creationDate,
					'targetID' : notificationObj.targetID,
					'targetContent' : notificationObj.targetContent
					};
	// var parentFolder = 'devices' + '/' + id.substring(20, 22);
	// var childFolder = parentFolder + '/' + id.substring(22, 24);
	// var designatedFolder = childFolder + '/' + id;
	// Find all device tokens associated with the quoter

	// fs.readdir(designatedFolder, function(err, files) {
		// if (err) {
		// 	console.log(err);
		// 	return;
		// }
		// files.forEach(function (file) {
		// 	if (file != '.DS_Store') {
		// 		var filePath = designatedFolder + '/' + file;
		// 		console.log('token path is ', filePath);
		// 		sendAPNPushNotification(filePath, {}, badge, message, payload);
		// 	}
		// });
	// });

	devices.forEach(function (device) {
		var parentFolder = 'devices' + '/' + device.deviceID.substring(32, 34);
		var childFolder = parentFolder + '/' + device.deviceID.substring(34, 36);
		var designatedFile = childFolder + '/' + device.deviceID;
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
