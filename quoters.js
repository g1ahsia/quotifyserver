var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');
var encryption = require('./encryption.js');

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
	var id = req.params.id;
	var num = 15;
	Queue.push(dbOperations.performDBOperation("findRecommendedQuoters", "quoters", null, {'num' : num}, res));
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

exports.randomQuote = function(req, res) {
	var id = req.params.id;
	Queue.push(dbOperations.performDBSearch("randomQuote", "quoters", id, null, res));
	Queue.execute();
};

// Add a new quoter
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

		// encrypt the password and save to db
		var cryptedPassword = encryption.encrypt(quoterObj["password"]);
		quoterObj["password"] = cryptedPassword;
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

		// encrypt the password and check in db
		var cryptedPassword = encryption.encrypt(quoterObj["password"]);
		quoterObj["password"] = cryptedPassword;

		console.log('login for ', new RegExp(quoterObj.email, "i"));

		Queue.push(dbOperations.performDBOperation("findOneByAttr", "quoters", null, {email : new RegExp(quoterObj.email, "i"), password : quoterObj.password}, res));
		Queue.execute();
	});
}

exports.verifyPassword = function(req, res) {
	var requestString = '';
	req.on("data",function(data){
		requestString += data.toString('utf8');

	});
	req.on('end', function() {
		var quoterObj = JSON.parse(requestString);

		// encrypt the password and check in db
		var cryptedPassword = encryption.encrypt(quoterObj["password"]);
		quoterObj["password"] = cryptedPassword;

		Queue.push(dbOperations.performDBOperation("findOneByAttr", "quoters", null, {email : new RegExp(quoterObj.email, "i"), password : quoterObj.password}, res));
		Queue.execute();
	});
}

exports.sendPassword = function(req, res) {
	var requestString = '';
	req.on("data",function(data){
		requestString += data.toString('utf8');

	});
	req.on('end', function() {
		var quoterObj = JSON.parse(requestString);
		console.log('sending password for ', new RegExp(quoterObj.email, "i"));
		Queue.push(dbOperations.performDBOperation("findOneByAttr", "quoters", null, {email : new RegExp(quoterObj.email, "i")}, null));
		Queue.push(dbOperations.performDBOperation("sendPassword", "quoters", null, null, res));
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

		// encrypt the password and update in db
		if (quoterObj["password"]) {
			var cryptedPassword = encryption.encrypt(quoterObj["password"]);
			quoterObj["password"] = cryptedPassword;
		}
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
		var notificationObj = quoteObj.notificationObj;
		delete quoteObj.notificationObj;
		quoteObj["creationDate"] = new Date();
		quoteObj["lastModified"] = new Date();
		notificationObj["quoterID"] = quoteObj.quoterID;
		notificationObj["creationDate"] = new Date();
		notificationObj["event"] = 0;
		notificationObj["targetID"] = quoteObj._id;
		notificationObj["targetContent"] = quoteObj.quote;
		notificationObj["originatorID"] = id;
		notificationObj["read"] = 0;
		// Don't send notification if quoter likes his own quote
		if (id != quoteObj.quoterID)
			Queue.push(dbOperations.performDBOperation("sendNotification", "notifications", null, notificationObj, null));
		Queue.push(dbOperations.performDBOperation("findOneByAttr", "dailyQuotes", null, {quoteID : quoteObj._id}, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToDailyQuote", "dailyQuotes", null, {'_id' : quoteObj._id, 'creationDate' : quoteObj.creationDate, 'point' : 1}, null));
		Queue.push(dbOperations.performDBOperation("findBoard", "boards", null, {'quoteID' : quoteObj._id, 'quoterID' : id}, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToMyBoard", "boards", id, quoteObj, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$addToSet : {likingQuotes : quoteObj._id}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", quoteObj._id, {$addToSet : {likedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set: {"lastModified" : quoteObj.lastModified}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", quoteObj._id, {$set: {"lastModified" : quoteObj.lastModified}}, res));

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
		quoteObj["lastModified"] = new Date();
		Queue.push(dbOperations.performDBOperation("findOneByAttr", "dailyQuotes", null, {quoteID : quoteObj._id}, null));
		Queue.push(dbOperations.performDBOperation("removeQuoteFromDailyQuote", "dailyQuotes", null, {'_id' : quoteObj._id, 'point' : -1}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$pull : {likingQuotes : quoteObj._id}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", quoteObj._id, {$pull : {likedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set: {"lastModified" : quoteObj.lastModified}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", quoteObj._id, {$set: {"lastModified" : quoteObj.lastModified}}, res));
		
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
		var notificationObj = quoteObj.notificationObj;
		delete quoteObj.notificationObj;
		quoteObj["creationDate"] = new Date();
		quoteObj["lastModified"] = new Date();
		// notificationObj["quoterID"] = quoteObj.quoterID;
		notificationObj["creationDate"] = new Date();
		notificationObj["event"] = 1;
		notificationObj["read"] = 0;
		// notificationObj["targetID"] = [quoteObj._id, quoteObj.collectionID];
		// notificationObj["targetContent"] = [quoteObj.quote, quoteObj.collectionTitle];
		// notificationObj["originatorID"] = id;
		// notificationObj["originatorName"] = quoteObj.originatorName;                         // already added in client side
		
		// Don't send notification if quoter likes his own quote
		// if (id != quoteObj.quoterID)
			Queue.push(dbOperations.performDBOperation("sendNotification", "notifications", null, notificationObj, null));
		Queue.push(dbOperations.performDBOperation("findOneByAttr", "dailyQuotes", null, {quoteID : quoteObj._id}, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToDailyQuote", "dailyQuotes", null, {'_id' : quoteObj._id, 'creationDate' : quoteObj.creationDate, 'point' : 2}, null));
		Queue.push(dbOperations.performDBOperation("findBoard", "boards", null, {'quoteID' : quoteObj._id, 'quoterID' : id}, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToMyBoard", "boards", id, quoteObj, null));
		Queue.push(dbOperations.performDBOperation("requote", "collections", quoteObj.collectionID, quoteObj, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", quoteObj._id, {$addToSet : {collections : quoteObj.collectionID}}, null));
		Queue.push(dbOperations.performDBOperation("update", "collections", quoteObj.collectionID, {$set: {"lastModified" : quoteObj.lastModified}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", quoteObj._id, {$set: {"lastModified" : quoteObj.lastModified}}, res));
		Queue.execute();
	});
}

exports.followQuoter = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data) {	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var quoterObj = JSON.parse(requestString);
		var notificationObj = quoterObj.notificationObj;
		delete quoterObj.notificationObj;
		quoterObj["lastModified"] = new Date();

		notificationObj["quoterID"] = quoterObj._id;
		notificationObj["creationDate"] = new Date();
		notificationObj["event"] = 2;
		notificationObj["targetID"] = quoterObj._id;
		notificationObj["targetContent"] = quoterObj.name;
		notificationObj["originatorID"] = id;
		notificationObj["read"] = 0;

		console.log("follow collection", JSON.stringify(notificationObj));
		Queue.push(dbOperations.performDBOperation("update", "quoters", quoterObj._id, {$addToSet : {followedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("sendNotification", "notifications", null, notificationObj, null));
		Queue.push(dbOperations.performDBOperation("followQuoter", "quoters", id, quoterObj, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set : {lastModified : quoterObj.lastModified}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", quoterObj._id, {$set : {lastModified : quoterObj.lastModified}}, res)); // return the updated quoter being followed

		Queue.execute();
	});
}

exports.unfollowQuoter = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var quoterObj = JSON.parse(requestString);
		quoterObj["lastModified"] = new Date();
		Queue.push(dbOperations.performDBOperation("update", "quoters", quoterObj._id, {$pull : {followedBy : id}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$pull : {'following' : {ownerID : quoterObj._id}}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", quoterObj._id, {$set : {lastModified : quoterObj.lastModified}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quoters", id, {$set : {lastModified : quoterObj.lastModified}}, res));
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

