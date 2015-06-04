var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

exports.findById = function(req, res) {
	var id = req.params.id;
	Queue.push(dbOperations.performDBOperation("findOne", "dailyQuotes", id, null, res));
	Queue.execute();
};

exports.findAll = function(req, res) {
	Queue.push(dbOperations.performDBOperation("findAll", "dailyQuotes", null, null, res));
	Queue.execute();
};

exports.findLatestPopular = function(req, res) {
	var num = req.params.num;
	Queue.push(dbOperations.performDBOperation("findLatestPopular", "dailyQuotes", null, {'num' : num}, res));
	Queue.execute();
};

exports.findByMonth = function(req, res) {
	var num = req.params.num;
	Queue.push(dbOperations.performDBOperation("findByMonth", "dailyQuotes", null, {'num' : num}, res));
	Queue.execute();
};