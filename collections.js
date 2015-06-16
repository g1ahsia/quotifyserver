var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

// Find collection by ID
exports.findById = function(req, res) {
	var id = req.params.id;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	// Queue.push(dbOperations.performDBOperation("findOne", "collections", id, null, res));
	Queue.push(dbOperations.performConditionalSearch("findOneConditional", "collections", id, null, req, res));
	Queue.execute();
};

// Find all collections
exports.findAll = function(req, res) {
	Queue.push(dbOperations.performDBOperation("findAll", "collections", null, null, res));
	Queue.execute();
}

// Get all the collections of a cetagory might be too big of a set of data
exports.findByCategory = function(req, res) {
	var category = req.params.category;
	console.log('Retrieving collection by Category: ' + category);
	// Queue.push(dbOperations.performDBOperation("findAll", "collections", null, {category : category}, res));
	Queue.push(dbOperations.performDBOperation("findAll", "collections", null, {$and : [{ $where: "this.quotes.length > 0" }, {category : category}]}, res));
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

exports.findRecommended = function(req, res) {
	var num = req.params.num;
	Queue.push(dbOperations.performDBOperation("findRecommendedCollections", "collections", null, {'num' : num}, res));
	Queue.execute();
}


// Add a new collection 
exports.addCollection = function(req, res) {
	var requestString = '';

	req.on("data",function(data){
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var collectionObj = JSON.parse(requestString);
		var notificationObj = collectionObj.notificationObj;
		delete collectionObj.notificationObj;
		collectionObj["quotes"] = [];
		collectionObj["followedBy"] = [];
		collectionObj["cover"] = "";
		collectionObj["creationDate"] = new Date();
		collectionObj["lastModified"] = new Date();
		// notificationObj["quoterID"]  don't know yet
		// notificationObj["targetContent"]  from device
		// notificationObj["originatorID"] from device
		// notificationObj["originatorName"] from device
		notificationObj["creationDate"] = new Date();
		notificationObj["event"] = 6;
		notificationObj["read"] = 0;
		Queue.push(dbOperations.performDBOperation("update", "quoters", collectionObj.ownerID, {$set: {"lastModified" : collectionObj.lastModified}}, null));
		Queue.push(dbOperations.performDBOperation("insert", "collections", null, collectionObj, null));
		Queue.push(dbOperations.performDBOperation("sendNotificationToQuoterFollowers", "notifications", null, notificationObj, null));
		Queue.push(dbOperations.performDBOperation("addCollectionToCategory", "collectionCategories", null, null, null)); 
		Queue.push(dbOperations.performDBOperation("addCollectionToQuoter", "quoters", collectionObj.ownerID, null, res)); // return the new collection to be inserted to core data
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
		collectionObj["lastModified"] = new Date();
		Queue.push(dbOperations.performDBOperation("findOne", "collections", id, null, null)); // find the existing collection to remove from the previous category
		Queue.push(dbOperations.performDBOperation("removeCollectionFromCategory", "collectionCategories", null, null, null)); 
		Queue.push(dbOperations.performDBOperation("update", "collections", id, {$set: {title : collectionObj.title, 
																						description : collectionObj.description, 
																						category : collectionObj.category, 
																						isPublic : collectionObj.isPublic, 
																						cover : collectionObj.cover,
																						lastModified : collectionObj.lastModified
																					}}, null));
		Queue.push(dbOperations.performDBOperation("addCollectionToCategory", "collectionCategories", null, null, res)); 
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
		var notificationObj = collectionObj.notificationObj;
		delete collectionObj.notificationObj;
		collectionObj["lastModified"] = new Date();

		notificationObj["quoterID"] = collectionObj.ownerID;
		notificationObj["creationDate"] = new Date();
		notificationObj["event"] = 3;
		notificationObj["targetID"] = collectionObj._id;
		notificationObj["targetContent"] = collectionObj.title;
		notificationObj["originatorID"] = id;
		notificationObj["read"] = 0;

		console.log("follow collection", JSON.stringify(notificationObj));
		Queue.push(dbOperations.performDBOperation("update", "collections", collectionObj._id, {$addToSet : {followedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", collectionObj.ownerID, {$addToSet : {followedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("sendNotification", "notifications", null, notificationObj, null));
		Queue.push(dbOperations.performDBOperation("followCollection", "quoters", id, collectionObj, null));
		Queue.push(dbOperations.performDBOperation("update", "collections", collectionObj._id, {$set : {lastModified : collectionObj.lastModified}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", collectionObj.ownerID, {$set : {lastModified : collectionObj.lastModified}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set : {lastModified : collectionObj.lastModified}}, res));
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
		collectionObj["lastModified"] = new Date();
		Queue.push(dbOperations.performDBOperation("update", "collections", collectionObj._id, {$pull : {followedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("unfollowCollection", "quoters", id, collectionObj, null));
		Queue.push(dbOperations.performDBOperation("update", "collections", collectionObj._id, {$set : {lastModified : collectionObj.lastModified}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set : {lastModified : collectionObj.lastModified}}, res));
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
		collectionObj["lastModified"] = new Date(); // to be implemented
		
		Queue.push(dbOperations.performDBOperation("findOne", "collections", collectionObj._id, null, null)); // find the existing collection to remove from the previous category
		Queue.push(dbOperations.performDBOperation("removeCollectionFromCategory", "collectionCategories", null, null, null)); 
		
		Queue.push(dbOperations.performDBOperation("pullCollectionFromQuotes", "quotes", collectionObj._id, collectionObj, null));
		Queue.push(dbOperations.performDBOperation("pullCollectionFromFollowingQuoters", "quoters", collectionObj._id, collectionObj, null));
		Queue.push(dbOperations.performDBOperation("remove", "collections", collectionObj._id, null, null));
		Queue.push(dbOperations.performDBOperation("removeCollectionFromQuoter", "quoters", collectionObj.ownerID, collectionObj, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", collectionObj.ownerID, {$set : {lastModified : collectionObj.lastModified}}, res));

		Queue.execute();
	});
}
