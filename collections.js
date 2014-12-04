var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

// Find collection by ID
exports.findById = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving collection by ID: ' + id);
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findOne", "collections", id, null, res));
	Queue.execute();
};

// Find all collections
exports.findAll = function(req, res) {
	Queue.push(dbOperations.performDBOperation("findAll", "collections", null, null, res));
	Queue.execute();
}

exports.findByCategory = function(req, res) {
	var category = req.params.category;
	console.log('Retrieving collection by Category: ' + category);
	Queue.push(dbOperations.performDBOperation("findAll", "collections", null, {category : category}, res));
	Queue.execute();
};

exports.search = function(req, res) {
	var query = req.params.query;
	var regEx = new RegExp("^" + query, "i");
	var num = req.params.num;
	console.log('Searching: ' + query);
	Queue.push(dbOperations.performDBSearch("indexSearch", "collections", {title : regEx}, {isPublic : 0}, {_id : -1}, parseInt(num), res));
	Queue.execute();
};

exports.textSearch = function(req, res) {
	var query = req.params.query;	
	var num = req.params.num;
	console.log('Text Searching: ' + query);
	Queue.push(dbOperations.performDBSearch("textSearch", "collections", {$text: {$search : query}}, {textScore: {$meta: "textScore"}}, {sort: {textScore: {$meta: "textScore"}}}, parseInt(num), res));
	Queue.execute();
};


// Add a new collection 
exports.addCollection = function(req, res) {
	var requestString = '';

	req.on("data",function(data){
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var collectionObj = JSON.parse(requestString);
		collectionObj["quotes"] = [];
		collectionObj["followedBy"] = [];
		collectionObj["cover"] = "";
		collectionObj["creationDate"] = new Date();
		// Queue.push(dbOperations.performDBOperation("insert", "collections", null, collectionObj, res));
		// collectionObj["quotes"] = [];
		Queue.push(dbOperations.performDBOperation("insert", "collections", null, collectionObj, null));
		Queue.push(dbOperations.performDBOperation("addCollectionToQuoter", "quoters", collectionObj.ownerID, null, res));
		Queue.execute();
	});
}
// Update an existing collection
exports.updateCollection = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var collectionObj = JSON.parse(requestString);
		Queue.push(dbOperations.performDBOperation("update", "collections", id, {$set: {title : collectionObj.title, description : collectionObj.description, category : collectionObj.category, isPublic: collectionObj.isPublic}}, res));
		Queue.execute();
	});
}

// exports.requoteQuote = function(req, res) {
// 	var id = req.params.id;
// 	var requestString = '';

// 	req.on("data",function(data){	
// 		requestString += data.toString('utf8');
// 	});
// 	req.on('end', function() {
// 		var quoteObj = JSON.parse(requestString);
// 		Queue.push(dbOperations.performDBOperation("update", "collections", id, {$addToSet : {quotes : quoteObj._id}}, null));
// 		Queue.push(dbOperations.performDBOperation("update", "quotes", quoteObj._id, {$addToSet : {collections : id}}, res));
// 		Queue.push(dbOperations.performDBOperation("findOneByAttr", "dailyQuotes", null, {quoteID : quoteObj._id}, null));
// 		Queue.push(dbOperations.performDBOperation("addQuoteToDailyQuote", "dailyQuotes", null, {'_id' : quoteObj._id, 'creationDate' : quoteObj.creationDate, 'point' : 2}, null));
// 		// Queue.push(dbOperations.performDBOperation("findBoard", "boards", null, {'quoteID' : quoteObj._id, 'quoterID' : id}, null));
// 		// Queue.push(dbOperations.performDBOperation("addQuoteToMyBoard", "boards", id, quoteObj, res));
// 		Queue.execute();
// 	});
// }

exports.chooseCover = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var quoteObj = JSON.parse(requestString);
		Queue.push(dbOperations.performDBOperation("update", "collections", id, {$set : {cover : quoteObj.imageID}}, res));
		Queue.execute();
	});
}

exports.followCollection = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data) {	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var collectionObj = JSON.parse(requestString);
		Queue.push(dbOperations.performDBOperation("update", "collections", collectionObj._id, {$addToSet : {followedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", collectionObj.ownerID, {$addToSet : {followedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("followCollection", "quoters", id, collectionObj, res));
		Queue.execute();
	});
}

exports.unfollowCollection = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var collectionObj = JSON.parse(requestString);
		Queue.push(dbOperations.performDBOperation("update", "collections", collectionObj._id, {$pull : {followedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("unfollowCollection", "quoters", id, collectionObj, res));
		Queue.execute();
	});
}

exports.deleteCollection = function(req, res) {
	var requestString = '';

	req.on("data",function(data) {	
		requestString += data.toString('utf8');
	});

	req.on('end', function() {
		var collectionObj = JSON.parse(requestString);
		Queue.push(dbOperations.performDBOperation("pullCollectionFromQuotes", "quotes", collectionObj._id, collectionObj, null));
		Queue.push(dbOperations.performDBOperation("pullCollectionFromFollowingQuoters", "quoters", collectionObj._id, collectionObj, null));
		Queue.push(dbOperations.performDBOperation("remove", "collections", collectionObj._id, null, res));
		Queue.execute();
	});
}
