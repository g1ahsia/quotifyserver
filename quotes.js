var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');


exports.findById = function(req, res) {
	var id = req.params.id;
	Queue.push(dbOperations.performDBOperation("findOne", "quotes", id, null, res));
	Queue.execute();
};

// exports.findNewer = function(req, res) {
// 	var id = req.params.id;
// 	var num = req.params.num;
// 	Queue.push(dbOperations.performDBOperation("findNewer", "quotes", id, {'num' : num}, res));
// 	Queue.execute();
// };

// exports.findOlder = function(req, res) {
// 	var id = req.params.id;
// 	var num = req.params.num;
// 	Queue.push(dbOperations.performDBOperation("findOlder", "quotes", id, {'num' : num}, res));
// 	Queue.execute();
// };

// Find quotes by quoter ID
exports.findByQuoterId = function(req, res) {
	var id = req.params.id;
	var num = req.params.num;
	Queue.push(dbOperations.performDBOperation("findLatest", "quotes", null, {'quoterID' : id, 'num' : num}, res));
	Queue.execute();
};

// Find recent images by quoter ID
exports.findRecentImagesByQuoterId = function(req, res) {
	var id = req.params.id;
	var num = req.params.num;
	Queue.push(dbOperations.performDBOperation("findDistinct", "quotes", null, {'quoterID' : id, 'num' : num,}, res));
	Queue.execute();
};

exports.search = function(req, res) {
	var name = req.params.name;
	var regEx = new RegExp("\\b" + name, "i");
	var num = req.params.num;
	Queue.push(dbOperations.performDBSearch("indexSearch", "quotes", {$or:[{quote : regEx}, {author : regEx}]}, null, null, parseInt(num), res));
	Queue.execute();
};

exports.textSearch = function(req, res) {
	var query = req.params.query;
	var num = req.params.num;
	console.log('Retrieving quote: ' + query + num);
	Queue.push(dbOperations.performDBSearch("textSearch", "quotes", {$text: {$search : query}}, {authorID: 0, textScore: {$meta: "textScore"}}, {sort: {textScore: {$meta: "textScore"}}}, parseInt(num), res));
	Queue.execute();
};


exports.findAll = function(req, res) {
	console.log("finding all quotes");
	Queue.push(dbOperations.performDBOperation("findAll", "quotes", null, null, res));
	Queue.execute();
};

exports.addQuote = function(req, res) {
	//var quote = req.body;
	var requestString = '';
	req.on("data",function(data) {
		requestString += data.toString('utf8');
	});

	req.on('end', function() {
		var quoteObj = JSON.parse(requestString);
		quoteObj["likedBy"] = [];
		quoteObj["comments"] = [];
		quoteObj["creationDate"] = new Date();
		Queue.push(dbOperations.performDBOperation("insert", "quotes", null, quoteObj, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToCollection", "collections", quoteObj.collections[0], null, null));
		// Add quote to the author collection
		Queue.push(dbOperations.performDBOperation("findOneByAttr", "authors", null, {name : quoteObj.author}, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToAuthor", "authors", null, quoteObj, null));
		// Add quote to boards of quoters who follow the collection
		Queue.push(dbOperations.performDBOperation("findOne", "collections", quoteObj.collections[0], null, null));
		Queue.push(dbOperations.performDBOperation("addQuoteToBoards", "boards", null, quoteObj, res));
		Queue.execute();
	});
}

exports.updateQuote = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});
	req.on('end', function() {
		var quoteObj = JSON.parse(requestString);
		quoteObj["likedBy"] = [];
		quoteObj["comments"] = [];
		Queue.push(dbOperations.performDBOperation("update", "quotes", id, {$set:{quote: quoteObj.quote, authorID: quoteObj.authorID, description: quoteObj.description, imageID: quoteObj.imageID}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", id, {$pull : {collections : quoteObj.originalCollectionID}}, null));
		Queue.push(dbOperations.performDBOperation("update", "quotes", id, {$addToSet : {collections : quoteObj.newCollectionID}}, null));
		Queue.push(dbOperations.performDBOperation("update", "collections", quoteObj.originalCollectionID, {$pull : {quotes : id}}, null));
		Queue.push(dbOperations.performDBOperation("update", "collections", quoteObj.newCollectionID, {$addToSet : {quotes : id}}, res));
		Queue.execute();
	});
}

exports.deleteQuote = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data) {	
		requestString += data.toString('utf8');
	});

	req.on('end', function() {
		var quoteObj = JSON.parse(requestString);
		Queue.push(dbOperations.performDBOperation("update", "quotes", id, {$pull : {collections : quoteObj.collectionID}}, null));
		Queue.push(dbOperations.performDBOperation("update", "collections", quoteObj.collectionID, {$pull : {quotes : id}}, res));
		Queue.execute();
	});
}

exports.addComment = function(req, res) {
	var id = req.params.id;
	var requestString = '';

	req.on("data",function(data){	
		requestString += data.toString('utf8');
	});

	req.on('end', function() {
		var commentObj = JSON.parse(requestString);
		commentObj["creationDate"] = new Date();
		Queue.push(dbOperations.performDBOperation("update", "quotes", id, {$addToSet : {comments : commentObj}}, res));
		Queue.execute();
	});
}

exports.getCommentsById = function(req, res) {
	var id = req.params.id;
	var num = req.params.num;
	Queue.push(dbOperations.performDBOperation("getComments", "quotes", id, null, res));
	Queue.execute();
};