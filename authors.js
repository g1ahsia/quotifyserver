var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

// Find collection by ID
exports.findById = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving quoter: ' + id);
	Queue.push(dbOperations.performDBOperation("findOne", "authors", id, null, res));
	Queue.execute();
};

// Find all collections
exports.findAll = function(req, res) {
	Queue.push(dbOperations.performDBOperation("findAll", "authors", null, null, res));
	Queue.execute();
};

exports.search = function(req, res) {
	var name = req.params.name;
	var regEx = new RegExp("\\b" + name, "i");
	var num = req.params.num
	Queue.push(dbOperations.performDBSearch("indexSearch", "authors", {name : regEx}, null, null, parseInt(num), res));
	Queue.execute();
};