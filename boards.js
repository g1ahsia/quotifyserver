var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

exports.findById = function(req, res) {
	var id = req.params.id;
	Queue.push(dbOperations.performDBOperation("findOne", "boards", id, null, res));
	Queue.execute();
};

exports.findAll = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findAll", "boards", null, null, res));
	Queue.execute();
};

exports.findLatest = function(req, res) {
	var id = req.params.id;
	var num = req.params.num;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findLatest", "boards", null, {'quoterID' : id, 'num' : num}, res));
	Queue.execute();
};

// version 3.0
exports.findLatestBoard = function(req, res) {
	var id = req.params.id;
	var num = req.params.num;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findLatestBoard", "boards", null, {'quoterID' : id, 'num' : num}, res));
	Queue.execute();
};

exports.findNewer = function(req, res) {
	var qtid = req.params.qtid;
	var qid = req.params.qid;
	var num = req.params.num;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findBoard", "boards", null, {'quoteID' : qid, 'quoterID' : qtid}, null));
	Queue.push(dbOperations.performDBOperation("findNewer", "boards", null, {'quoterID' : qtid, 'num' : num}, res));
	Queue.execute();
};

// version 3.0
exports.findNewerBoard = function(req, res) {
	var qtid = req.params.qtid;
	var qid = req.params.qid;
	var num = req.params.num;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findBoard", "boards", null, {'quoteID' : qid, 'quoterID' : qtid}, null));
	Queue.push(dbOperations.performDBOperation("findNewerBoard", "boards", null, {'quoterID' : qtid, 'num' : num}, res));
	Queue.execute();
};

exports.findOlder = function(req, res) {
	var qtid = req.params.qtid;
	var qid = req.params.qid;
	var num = req.params.num;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findBoard", "boards", null, {'quoteID' : qid, 'quoterID' : qtid}, null));
	Queue.push(dbOperations.performDBOperation("findOlder", "boards", null, {'quoterID' : qtid, 'num' : num}, res));
	Queue.execute();
};

// version 3.0
exports.findOlderBoard = function(req, res) {
	var qtid = req.params.qtid;
	var qid = req.params.qid;
	var num = req.params.num;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findBoard", "boards", null, {'quoteID' : qid, 'quoterID' : qtid}, null));
	Queue.push(dbOperations.performDBOperation("findOlderBoard", "boards", null, {'quoterID' : qtid, 'num' : num}, res));
	Queue.execute();
};

exports.addQuote = function(req, res) {
	var qtid = req.params.qtid;
	var requestString = '';

	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var quoteObj = JSON.parse(requestString);
		quoteObj["creationDate"] = new Date();
		Queue.push(dbOperations.performDBOperation("findBoard", "boards", null, {'quoteID' : quoteObj._id, 'quoterID' : qtid}, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToMyBoard", "boards", qtid, quoteObj, res));
		Queue.execute();
	});
};