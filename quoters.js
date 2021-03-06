var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

// Find collection by ID
exports.findById = function(req, res) {
	var id = req.params.id;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	// Queue.push(dbOperations.performDBOperation("findOne", "quoters", id, null, res));
	Queue.push(dbOperations.performConditionalSearch("findOneConditional", "quoters", id, null, req, res));
	Queue.execute();
};

exports.findByEmail = function(req, res) {
	var email = req.params.email;
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findOneByAttr", "quoters", null, {'email' : email}, res));
	Queue.execute();
};

// Find all quoters
exports.findAll = function(req, res) {
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	Queue.push(dbOperations.performDBOperation("findAll", "quoters", null, null, res));
	Queue.execute();
};

exports.findRecommended = function(req, res) {
	var num = req.params.num;
	Queue.push(dbOperations.performDBOperation("findRecommended", "quoters", null, {'num' : num}, res));
	Queue.execute();
}

exports.search = function(req, res) {
	var name = req.params.name;
	// var nameArray = name.split(" ");
	// var name1 = nameArray[0];
	// var name2 = nameArray[1];
	var regEx = new RegExp("\\b" + name, "i");
	// var regEx1 = new RegExp("\\b" + name1 + ".* \\b" + name2, "i");
	// var regEx2 = new RegExp("\\b" + name2 + ".* \\b" + name1, "i");
	var num = req.params.num;
	// console.log('Finding quoter: ' + name1 + name2);
	// Queue.push(dbOperations.performDBSearch("indexSearch", "quoters", {$or:[{name : regEx}, {name : regEx2}]}, null, null, parseInt(num), res));
	Queue.push(dbOperations.performDBSearch("indexSearch", "quoters", {name : regEx}, null, null, parseInt(num), res));
	Queue.execute();
};

exports.textSearch = function(req, res) {
	var name = req.params.name;
	var num = req.params.num;
	Queue.push(dbOperations.performDBSearch("textSearch", "quoters", {$text: {$search : name}}, {textScore: {$meta: "textScore"}}, {sort: {textScore: {$meta: "textScore"}}}, parseInt(num), res));
	Queue.execute();
};

// Add a new collection
exports.addQuoter = function(req, res) {
	var requestString = '';
	//var collection = req.body;
	req.on("data",function(data) {
		requestString += data.toString('utf8');
	});

	req.on('end', function() {
		var quoterObj = JSON.parse(requestString);
		// quoterObj["favoriteQuoteID"] = ""; // version 2.0 depreciated
		quoterObj["avatar"] = ""; 
		quoterObj["favoriteQuote"] = ""; // version 3.0
		quoterObj["favoriteAuthor"] = ""; // version 3.0
		quoterObj["backgroundImage"] = ""; // version 3.0
		quoterObj["collections"] = [];
		quoterObj["following"] = [];
		quoterObj["followedBy"] = [];
		quoterObj["subscribingTags"] = [];
		quoterObj["likingQuotes"] = [];
		quoterObj["isValid"] = 1;
		quoterObj["creationDate"] = new Date();
		quoterObj["lastModified"] = new Date();
		Queue.push(dbOperations.performDBOperation("insertQuoter", "quoters", null, quoterObj, res));
		Queue.execute();
	});

}

// Login
exports.loginQuoter = function(req, res) {
	var requestString = '';
	//var collection = req.body;
	req.on("data",function(data){
		requestString += data.toString('utf8');

	});
	req.on('end', function() {
		var quoterObj = JSON.parse(requestString);
		Queue.push(dbOperations.performDBOperation("findOneByAttr", "quoters", null, {email : new RegExp(quoterObj.email, "i"), password : quoterObj.password}, res));
		Queue.execute();
	});
}

// Update an existing collection
exports.updateQuoter = function(req, res) {
	var id = req.params.id;
	var requestString = '';
	//var collection = req.body;
	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});

	req.on('end', function() {
		var quoterObj = JSON.parse(requestString);
		quoterObj["lastModified"] = new Date();
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set:quoterObj}, res));
		Queue.execute();
	});
}

exports.likeQuote = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var quoteObj = JSON.parse(requestString);
		quoteObj["creationDate"] = new Date();
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$addToSet : {likingQuotes : quoteObj._id}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", quoteObj._id, {$addToSet : {likedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("findOneByAttr", "dailyQuotes", null, {quoteID : quoteObj._id}, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToDailyQuote", "dailyQuotes", null, {'_id' : quoteObj._id, 'creationDate' : quoteObj.creationDate, 'point' : 1}, null));
		Queue.push(dbOperations.performDBOperation("findBoard", "boards", null, {'quoteID' : quoteObj._id, 'quoterID' : id}, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToMyBoard", "boards", id, quoteObj, res));
		Queue.execute();
	});
}

exports.unlikeQuote = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});

	req.on('end', function() {
		var quoteObj = JSON.parse(requestString);
		quoteObj["creationDate"] = new Date();
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$pull : {likingQuotes : quoteObj._id}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", quoteObj._id, {$pull : {likedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("findOneByAttr", "dailyQuotes", null, {quoteID : quoteObj._id}, null));
		Queue.push(dbOperations.performDBOperation("removeQuoteFromDailyQuote", "dailyQuotes", null, {'_id' : quoteObj._id, 'point' : -1}, res));
		Queue.execute();
	});
}

exports.requoteQuote = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var quoteObj = JSON.parse(requestString);
		quoteObj["creationDate"] = new Date();
		Queue.push(dbOperations.performDBOperation("requote", "collections", quoteObj.collectionID, quoteObj, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", quoteObj._id, {$addToSet : {collections : quoteObj.collectionID}}, null));
		Queue.push(dbOperations.performDBOperation("findOneByAttr", "dailyQuotes", null, {quoteID : quoteObj._id}, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToDailyQuote", "dailyQuotes", null, {'_id' : quoteObj._id, 'creationDate' : quoteObj.creationDate, 'point' : 2}, null));
		Queue.push(dbOperations.performDBOperation("findBoard", "boards", null, {'quoteID' : quoteObj._id, 'quoterID' : id}, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToMyBoard", "boards", id, quoteObj, res));
		Queue.execute();
	});
}

exports.chooseFavorite = function(req, res) {
	var id = req.params.id;
	var requestString = '';
	
	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var quoteObj = JSON.parse(requestString);
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set : {favoriteQuoteID : quoteObj._id}}, res));
		Queue.execute();
	});
}

exports.invalidateQuoter = function(req, res) {
	var id = req.params.id;
	Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set : {isValid: 0}}, res));
	Queue.execute();
}

