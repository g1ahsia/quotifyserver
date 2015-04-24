var apn = require('apn');
var fs = require('fs');


var filePath = 'devices/F6/99/756033B5-9802-403B-B773-B173732CF699';
var options = { 
    cert:'cert.pem',
    key:'key.pem',
    gateway:'gateway.sandbox.push.apple.com'
   };
var badge = 120;
var message = 'test notification 2';
var payload = {};

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