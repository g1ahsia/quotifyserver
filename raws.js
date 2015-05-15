var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

exports.findAll = function(req, res) {
	console.log("finding all quotes");
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findAll", "raws", null, null, res));
	Queue.execute();
};

exports.textSearch = function(req, res) {
	var query = req.params.query;
	var num = req.params.num;
	console.log('Retrieving quote: ' + query + num);
	Queue.push(dbOperations.performDBSearch("textSearch", "raws", {$text: {$search : query}}, {textScore: {$meta: "textScore"}}, {sort: {textScore: {$meta: "textScore"}}}, parseInt(num), res));
	Queue.execute();
};