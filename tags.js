var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

exports.findAll = function(req, res) {
	console.log("finding all quotes");
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findAll", "tags", null, null, res));
	Queue.execute();
};

exports.findByHashtag = function(req, res) {
	var tag = req.params.tag;
	Queue.push(dbOperations.performDBSearch("findOneByAttr", "tags", null, {'tag' : '#' + tag}, res));
	Queue.execute();
};