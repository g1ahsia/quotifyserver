var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');
var fs = require('fs');

exports.addDevice = function(req, res) {
	var id = req.params.id;
	var UUID = req.params.UUID;
	console.log('adding tokenof quoter', id, ' with device uuid ', UUID);
	var body = '';
	req.on("data",function(data) {
		body += data;
		console.log('getting token ', data.toString());
	});

	req.on('end', function() {
		// sample id: 545cc31a54573f4d15bee9f3
		var token = body.toString();
		var parentFolder = 'devices' + '/' + UUID.substring(32, 34);
		var childFolder = parentFolder + '/' + UUID.substring(34, 36);
		var designatedFile = childFolder + '/' + UUID;
		Queue.push(dbOperations.performDBOperation("addDevice", "devices", null, {'quoterID' : id, 'deviceID' : UUID}, res));
		Queue.execute();
		// save to folder sample name: devices/e9/f3/545cc31a54573f4d15bee9f3 with sample device id 7DBDB86C-88B9-4257-939E-4798F1AC783F
		fs.mkdir(parentFolder, function(err) {
			fs.mkdir(childFolder, function(err) {
				// if (err) throw err;
				fs.writeFile(designatedFile, token, function (err) {
					// if (err) throw err;
					console.log('Token is saved!');
				});
			});
		});
	});
}

exports.unlinkDevice = function(req, res) {
	var UUID = req.params.UUID;
	Queue.push(dbOperations.performDBOperation("unlinkDevice", "devices", null, {'deviceID' : UUID}, res));
	Queue.execute();
}

exports.getDevices = function(id) {
	var parentFolder = 'devices' + '/' + id.substring(20, 22);
	var childFolder = parentFolder + '/' + id.substring(22, 24);
	var designatedFolder = childFolder + '/' + id;
	fs.readdir(designatedFolder, function(err, files) {
		if (err) throw err;
		console.log(files);
		return files;
	});
}