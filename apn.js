// var apn = require('apn');
// var options = { };


// var fs = require('fs');
// fs.readFile('token', function (err, token) {
//   if (err) {
//     throw err; 
//   }
//   	console.log(token.toString());
//  	var apnConnection = new apn.Connection(options);
//  	var myDevice = new apn.Device(token);

//  	var note = new apn.Notification();

// 	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
// 	note.badge = 52;
// 	note.sound = "ping.aiff";
// 	note.alert = "\uD83D\uDCE7 \u2709 Quote 2";
// 	note.payload = {'messageFrom': 'Caroline'};

// 	apnConnection.pushNotification(note, myDevice);
// });

