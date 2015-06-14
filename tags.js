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

exports.follow = function(req, res) {
	var tag = req.params.tag;
	var id = req.params.id;

	var tagObj = {};
	tagObj['tag'] = '#' + tag;
	tagObj['quoterID'] = id;
	var now = new Date();
	Queue.push(dbOperations.performDBOperation("followTag", "tags", null, tagObj, null));
	Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$addToSet : {'subscribingTags' : tagObj.tag}}, null));
	Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set : {lastModified : now}}, res));
	Queue.execute();
};

exports.unfollow = function(req, res) {
	var tag = req.params.tag;
	var id = req.params.id;

	var tagObj = {};
	tagObj['tag'] = '#' + tag;
	tagObj['quoterID'] = id;
	var now = new Date();
	Queue.push(dbOperations.performDBOperation("unfollowTag", "tags", null, tagObj, null));
	Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$pull : {'subscribingTags' : tagObj.tag}}, null));
	Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set : {lastModified : now}}, res));
	Queue.execute();
};