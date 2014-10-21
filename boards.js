var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

exports.findById = function(req, res) {
	var id = req.params.id;
	Queue.push(dbOperations.performDBOperation("findOne", "boards", id, null, res));
	Queue.execute();
};

exports.findAll = function(req, res) {
	Queue.push(dbOperations.performDBOperation("findAll", "boards", null, null, res));
	Queue.execute();
};

exports.findLatest = function(req, res) {
	var id = req.params.id;
	var num = req.params.id;
	Queue.push(dbOperations.performDBOperation("findLatest", "boards", null, {'quoterID' : id, 'num' : num}, res));
	Queue.execute();
};

exports.findNewer = function(req, res) {
	var qtid = req.params.qtid;
	var qid = req.params.qid;
	var num = req.params.num;
	Queue.push(dbOperations.performDBOperation("findNewer", "boards", qid, {'quoterID' : qtid, 'num' : num}, res));
	Queue.execute();
};

exports.findOlder = function(req, res) {
	var qtid = req.params.qtid;
	var qid = req.params.qid;
	var num = req.params.num;
	Queue.push(dbOperations.performDBOperation("findOlder", "boards", qid, {'quoterID' : qtid, 'num' : num}, res));
	Queue.execute();
};