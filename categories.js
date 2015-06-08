var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

exports.findAllCollectionCategories = function(req, res) {
	console.log("finding all quotes");
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findByPriority", "collectionCategories", null, null, res));
	Queue.execute();
};

exports.findAllImageCategories = function(req, res) {
	console.log("finding all quotes");
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findByPriority", "imageCategories", null, null, res));
	Queue.execute();
};

exports.addCollectionCategory = function(req, res) {
	var requestString = '';

	req.on("data",function(data){
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var collectionCatObj = JSON.parse(requestString);
		collectionCatObj["collections"] = [];
		Queue.push(dbOperations.performDBOperation("insert", "collectionCategories", null, collectionCatObj, res));
		Queue.execute();
	});
}

exports.addImageCategory = function(req, res) {
	var requestString = '';

	req.on("data",function(data){
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var imageCatObj = JSON.parse(requestString);
		imageCatObj["images"] = [];
		Queue.push(dbOperations.performDBOperation("insert", "imageCategories", null, imageCatObj, res));
		Queue.execute();
	});
}

exports.findImageCategoryByName = function(req, res) {
	var requestString = '';
	req.on("data",function(data){
		requestString += data.toString('utf8');
	});
	req.on('end', function() {	
		var name = req.params.name;
		Queue.push(dbOperations.performDBOperation("findOneByAttr", "imageCategories", null, {'name' : name}, res));
		Queue.execute();
	});
}