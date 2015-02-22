var mongo = require('mongodb');
var winston = require('winston');
var notifications = require('./notifications.js');

var Server = mongo.Server,
	BSON = mongo.BSONPure,
	Db = mongo.Db;
	
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('quotedb', server, {safe:false});

// Init logger
var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console),
		new (winston.transports.File)({filename : 'logs/main.log'})
	],
	exceptionHandlers: [
		new (winston.transports.File)({filename : 'logs/exceptions.log'}) 
	]
});

// Setting log levels
// logger.log('info', 'Hello quotes');
// logger.log('warn', 'warning log');
// logger.log('error', 'error log');

db.open(function(err, db) {
	console.log( "opening connnection to mongodb");
	if(!err) {
		console.log("Connected to database");
		// dropping indexes
		// db.collection('quotes', function(err, collection) {
		// 	collection.dropIndexes(function(err, bool) {
		// 		if (bool) 
		// 			console.log('All indexes are dropped');
		// 		else
		// 			console.log('Index drop failed');
		// 	});
		// });

		// creating indexes
		db.collection('quotes', function(err, collection) {
			collection.indexes(function(err, indexes) {
				console.log("Quotes indexes: " + JSON.stringify(indexes));
			});
		});
		console.log('creating indexes');
		// create queries index query_1_occur and search to auto-complete searches
		db.createIndex('queries', {query: 1, occurrence: -1}, function(err, indexName) {
			console.log("1. index name: " + indexName);
		});

		// create queries index quoterID_1_creationDate_-1 to find recent searches made by quoter
		db.createIndex('queries', {quoterID: 1, creationDate: -1}, function(err, indexName) {
			console.log("2. index name: " + indexName);
		});

		// create index to aid search for collections title to find collection with prefix
		db.createIndex('collections', {title:1}, function(err, indexName) {
			console.log("3. index name: " + indexName);

		});

		// create index to aid search for quoters quoter firstname and lastname
		db.createIndex('quoters', {name:1}, function(err, indexName) {
			console.log("4. index name: " + indexName);
		});

		// Create text indexes for quoters fullName and reverse fullname
		// refer to http://docs.mongodb.org/manual/reference/operator/query/text/#text-operator-phrases
		// http://stackoverflow.com/questions/16902674/mongodb-text-search-and-multiple-search-words
		db.createIndex('quoters', {name:"text"}, function(err, indexName) {
			console.log("5. index name: " + indexName);

		});

		db.createIndex('quotes', {quote:1, author:1}, function(err, indexName) {
			console.log("6. index name: " + indexName);
		});

		// create text indexes for quotes collection, search using " " to find the exact phrase in quotes
		db.createIndex('quotes', {quote:"text", author:"text", description:"text"}, function(err, indexName) {
			console.log("7. index name: " + indexName);
		});

		// create text indexes for collections collection
		db.createIndex('collections', {title:"text", description:"text"}, function(err, indexName) {
			console.log("8. index name: " + indexName);
		});

		db.createIndex('images', {tags:"text"}, function(err, indexName) {
			console.log("9. index name: " + indexName);

		});

		db.createIndex('images', {tags:"1"}, function(err, indexName) {
			console.log("9. index name: " + indexName);

		});


		// db.createIndex('quoters', [{"following.ownerID" : 1}, {unique : true}], function(err, indexName) {
		// 	console.log("8. index name: " + indexName);

		// });

		// db.collection('collections', {strict:true}, function(err, collection) {
		// 	if (err) {
		// 		console.log("The 'collections' collection doesn't exist. Creating it with sample data...");
				//populateDB();
		// 	}
		// });
	}
	else {
		console.log("Failed connecting to database");
	}

});

var findOneTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
				console.log("[findOneTask] Finding one " + id + " in " + colName);
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					results = []; //nullify the results array
					results.push(item);
					if (res) { 
						// res.writeHead(304, "Not Modified");
						// res.send(item);
						// res.statusCode = 304;
						// res.end();
						res.send();
					}
					logger.log('info', 'findOneTask', {'_id': id});
					callback();
				}
			});
		});
	};
}


var findOneConditionalTask = function(colName, id, payload, req, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
				var modifiedSince = req.headers["if-modified-since"];
				var lastModified;
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} 
				else if (!item) {
					if (res) {
						res.statusCode = 404;
						res.end();
					}
				}
				else {
					results = []; //nullify the results array
					results.push(item);
					if (res) {
						// Get last modified in version 2 and 3
						if (!item.lastModified) {
							lastModified = item.creationDate;
							console.log("lastModified is null");
						}
						else {
							lastModified = item.lastModified;
							console.log("lastModified is not null");
						} 
						// Determine what to send in the response depending on date of last modification 
						if (!modifiedSince)
							res.send(item);
						else {
							modifiedSince = new Date(modifiedSince);
						    lastModified = new Date(lastModified);
							if (lastModified > modifiedSince) {
								res.send(item);
								console.log("updated");
							}
							else {
								console.log("not updated");
								res.statusCode = 304;
								res.end();
							}
						}
					}
					logger.log('info', 'findOneConditionalTask', {'_id': id});
					callback();
				}
			});
		});
	};
}

var findAllTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.find(payload).toArray(function(err, items) {
				console.log("[findAllTask] Finding all in " + colName);
				logger.info('findAllTask');
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					if (res) res.send(items);
					logger.info('findAllTask', items);
					callback();
				}
			});
		});
	};
}

var findAllByAttrTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.find(payload).toArray(function(err, items) {
				console.log("[findAllByAttrTask] Finding one " + id + " in " + colName);
				logger.info('findAllByAttrTask');
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					if (res) res.send(items);
					logger.info('findAllByAttrTask', items);
					callback();
				}
			});
		});
	};
}

var findOneByAttrTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			console.log("[findOneByAttrTask] : Finding " + JSON.stringify(payload) + " in " + colName);
			collection.findOne(payload, function(err, item) {
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('Successfully found record: ' + JSON.stringify(item));
					results = []; //nullify the results array
					results.push(item);
					if (res) res.send(item);
					callback();
				}
			});
		});
	};
}

// var findLatestTask = function(colName, id, payload, res) {
// 	return function(callback) {
// 		db.collection(colName, function(err, collection) {
// 			collection.find({'quoterID' : payload.quoterID}).limit(parseInt(payload.num)).sort({'_id' : -1}).toArray(function(err, items) {
// 				console.log("[findLatestTask] Finding latest of quoterID " + payload.quoterID + "limit" + payload.num);
// 				if (err) {
// 					logger.error(err);
// 					if (res) res.send({'error':'An error has occurred'});
// 				} else {
// 					results = []; //nullify the results array
// 					results.push(items);
// 					if (res) res.send(items);
// 					callback();
// 				}
// 			});
// 		});
// 	};
// }

var findLatestBoardTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.find({'quoterID' : payload.quoterID}).limit(parseInt(payload.num)).sort({'_id' : -1}).toArray(function(err, items) {
				console.log("[findLatestBoardTask] Finding latest board of quoterID " + payload.quoterID);
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					results = []; //nullify the results array
					results.push(items);
					if (res) res.send(items);
					callback();
				}
			});
		});
	};
}

var findLatestTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.find({'quoterID' : payload.quoterID}).limit(parseInt(payload.num)).sort({'_id' : -1}).toArray(function(err, items) {
				console.log("[findLatestTask] Finding latest of quoterID " + payload.quoterID);
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					results = [];
					var i = 0;
					if (items.length != 0) {
						items.forEach(function (quote) {
							db.collection('quotes', function(err, col) {
								console.log(quote.quoteID);
								appendQuoteToQuoteArray(col, quote, i, items.length, res, callback);
								i++;
							});
						});
					}
					else {
						res.send(results);
						callback();
					}
				}
			});
		});
	};
}

// Helper function to add quote to array in order
var appendQuoteToQuoteArray = function(col, quote, index, numOfQuotes, res, callback) {
	col.findOne({'_id' : new BSON.ObjectID(quote.quoteID)}, function(err, item) {
		results[index] = item;
		console.log("appending result at index", index, "length is ", results.filter(String).length);
		if (results.filter(String).length == numOfQuotes) {
			res.send(results);
			callback();
		}
	});
}

var appendQuoterToQuoterArray = function(col, quoter, index, numOfQuoters, res, callback) {
	col.findOne({'_id' : new BSON.ObjectID(quoter._id)}, function(err, item) {
		results[index] = item;
		if (results.filter(String).length == numOfQuoters) {
			res.send(results);
			callback();
		}
	});
}

// find recent images (not generic)
var findDistinctTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.distinct('imageID', {'quoterID' : payload.quoterID}, function(err, item) {
				console.log("[findDistinctTask] Finding distinct of quoterID " + payload.quoterID);
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					results = []; //nullify the results array
					results.push(item);
					if (res) res.send(item);
					callback();
				}
			});
		});
	};
}

// var findLatestPopularTask = function(colName, id, payload, res) {
// 	return function(callback) {
// 		db.collection(colName, function(err, collection) {
// 			collection.find().limit(parseInt(payload.num)).sort({'popularity' : -1, '_id' : -1}).toArray(function(err, items) {
// 				console.log("[findLatestPopularTask] Finding latest popular");
// 				if (err) {
// 					logger.error(err);
// 					if (res) res.send({'error':'An error has occurred'});
// 				} else {
// 					results = []; //nullify the results array
// 					results.push(items);
// 					if (res) res.send(items);
// 					callback();
// 				}
// 			});
// 		});
// 	};
// }

var findLatestPopularTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.find().limit(parseInt(payload.num)).sort({'popularity' : -1, '_id' : -1}).toArray(function(err, items) {
				console.log("[findLatestPopularTask] Finding latest popular");
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					results = [];
					var i = 0;
					if (items.length != 0) {
						items.forEach(function (quote) {
							db.collection('quotes', function(err, col) {
								console.log(quote.quoteID);
								appendQuoteToQuoteArray(col, quote, i, items.length, res, callback);
								i++;
							});
						});
					}
					else {
						res.send(results);
						callback();
					}
				}
			});
		});
	};
}

var findRecommendedTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.aggregate(
									{$unwind : '$followedBy'}, 
									{$group : { _id : "$_id", number : { $sum : 1 } } },
									{$sort : {number : -1}}, 
									{$limit : parseInt(payload.num)}, function(err, items) {
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					// console.log('Successfully found record: ' + JSON.stringify(items));
					// results = []; //nullify the results array
					// results.push(items);
					// if (res) res.send(items);
					// callback();
					results = [];
					var i = 0;
					if (items.length != 0) {
						items.forEach(function (quoter) {
							db.collection('quoters', function(err, col) {
								console.log(quoter._id);
								appendQuoterToQuoterArray(col, quoter, i, items.length, res, callback);
								i++;
							});
						});
					}
					else {
						res.send(results);
						callback();
					}
				}
			});
		});
	};
}

var findBoardTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			console.log("[findBoardTask] : Finding " + JSON.stringify(payload) + " in " + colName);
			collection.findOne({'quoterID' : payload.quoterID, 'quoteID' : new BSON.ObjectID(payload.quoteID)}, function(err, item) {
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('Successfully found record: ' + JSON.stringify(item));
					results = []; //nullify the results array
					results.push(item);
					if (res) res.send(item);
					callback();
				}
			});
		});
	};
}

var findNewerBoardTask = function(colName, id, payload, res) {
	return function(callback) {
		var boardObj = payload;
		db.collection(colName, function(err, collection) {
			collection.find({'quoterID' : boardObj.quoterID, 'creationDate' : {"$gt" : new Date(boardObj.creationDate)}}).limit(parseInt(boardObj.num)).sort({'_id' : -1}).toArray(function(err, items) {
				console.log("[findNewerBoardTask] Finding newer");
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					results = []; //nullify the results array
					results.push(items);
					if (res) res.send(items);
					callback();
				}
			});
		});
	};
}

var findNewerTask = function(colName, id, payload, res) {
	return function(callback) {
		var boardObj = results.shift();
		if (boardObj == null) {
			res.send(null);
			return;
		}
		db.collection(colName, function(err, collection) {
			collection.find({'quoterID' : payload.quoterID, '_id' : {"$gt" : new BSON.ObjectID(boardObj._id)}}).limit(parseInt(payload.num)).sort({'_id' : -1}).toArray(function(err, items) {
				console.log("[findNewerTask] Finding newer");
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					results = [];
					var i = 0;
					if (items.length != 0) {
						items.forEach(function (quote) {
							db.collection('quotes', function(err, col) {
								console.log(quote.quoteID);
								appendQuoteToQuoteArray(col, quote, i, items.length, res, callback);
								i++;
							});
						});
					}
					else {
						res.send(results);
						callback();
					}
				}
			});
		});
	};
}

var findOlderBoardTask = function(colName, id, payload, res) {
	return function(callback) {
		var boardObj = payload;
		db.collection(colName, function(err, collection) {
			collection.find({'quoterID' : boardObj.quoterID, 'creationDate' : {"$lt" : new Date(boardObj.creationDate)}}).limit(parseInt(boardObj.num)).sort({'_id' : -1}).toArray(function(err, item) {
				console.log("[findOlderBoardTask] Finding older");
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('Successfully found record: ' + JSON.stringify(item));
					results = []; //nullify the results array
					results.push(item);
					if (res) res.send(item);
					callback();
				}
			});
		});
	};
}

var findOlderTask = function(colName, id, payload, res) {
	return function(callback) {
		var boardObj = results.shift();
		if (boardObj == null) {
			res.send(null);
			return;
		}
		db.collection(colName, function(err, collection) {
			collection.find({'quoterID' : payload.quoterID, '_id' : {"$lt" : new BSON.ObjectID(boardObj._id)}}).limit(parseInt(payload.num)).sort({'_id' : -1}).toArray(function(err, items) {
				console.log("[findOlderTask] Finding older");
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					results = [];
					var i = 0;
					if (items.length != 0) {
						items.forEach(function (quote) {
							db.collection('quotes', function(err, col) {
								console.log(quote.quoteID);
								appendQuoteToQuoteArray(col, quote, i, items.length, res, callback);
								i++;
							});
						});
					}
					else {
						res.send(results);
						callback();
					}
				}
			});
		});
	};
}

var indexSearchTask = function(colName, query, output, sort, num, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.find(query).sort(sort).limit(num).toArray(function(err, items) {
				console.log("[indexSearchTask]");
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					if (res) res.send(items);
					callback();
				}
			});
		});
	};
}

var textSearchTask = function(colName, query, output, sort, num, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.find(query, output, sort).limit(num).toArray(function(err, items) {
				console.log("[textSearchTask]");
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					if (res) res.send(items);
					callback();
				}
			});
		});
	};
}

var updateTask = function(colName, id, payload, res){
	return function(callback) {
		db.collection(colName, function(err, collection) {
			// collection.update({'_id': new BSON.ObjectID(id)}, payload, {safe:true}, function(err, result) {
				collection.findAndModify({'_id': new BSON.ObjectID(id)}, [['_id',1]], payload, {new : true}, function(err, result) {
				console.log("[updateTask] Updating", id, JSON.stringify(payload), " in ", colName);
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('' + result + ' document(s) updated with id ' + id);

					if (res) res.send(result);
					callback();
				}
			});
		});
	};
}

var followCollectionTask = function(colName, id, collectionObj, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.findOne({'_id': new BSON.ObjectID(id), 'following.ownerID' : collectionObj.ownerID},function(err, item) {
				console.log("[followCollectionTask]: " + id + " collection ownerID: " + collectionObj.ownerID);
				// Insert to following field
				if (item == null) {
					// collection.update({'_id': new BSON.ObjectID(id)}, {$addToSet : {'following' : {"ownerID" : collectionObj.ownerID, "collections" : [collectionObj._id]}}}, {safe:true}, function(err, result) {

					// 	if (err) {
					// 		console.log('Error updating collections ' + err);
					// 		res.send({'error':'An error has occurred'});
					// 	} else {
					// 		console.log('' + result[0] + ' document(s) created with id ' + id);
							
					// 		if (res) res.send({'OK':'Successfully created record'});
					// 		callback();
					// 	}
					// });
					insertToFollowing(collection, id, collectionObj.ownerID, collectionObj._id, res, callback);
				}
				// Append to following field
				else {
					// collection.update({'_id': new BSON.ObjectID(id), 'following.ownerID' : collectionObj.ownerID}, {$addToSet : {'following.$.collections' : collectionObj._id}}, {safe:true}, function(err, result) {
					// 	console.log(colName, id, JSON.stringify(collectionObj));
					// 	if (err) {
					// 		console.log('Error updating collections ' + err);
					// 		res.send({'error':'An error has occurred'});
					// 	} else {
					// 		console.log('' + result[0] + ' document(s) updated with id ' + id);
							
					// 		if (res) res.send({'OK':'Successfully updated record'});
					// 		callback();
					// 	}
					// });
					appendToFollowing(collection, id, collectionObj.ownerID, collectionObj._id, res, callback);
				}
			});
		});
	};
}

// Helper methods for quoter following collection
var insertToFollowing = function(collection, quoterID, collectionOwnerID, collectionID, res, callback) {
	collection.update({'_id': new BSON.ObjectID(quoterID)}, {$addToSet : {'following' : {"ownerID" : collectionOwnerID, "collections" : [collectionID]}}}, {safe:true}, function(err, result) {
		if (err) {
			logger.error(err);
			console.log('Error updating collections ' + err);
			if (res) res.send({'error':'An error has occurred'});
		} else {
			console.log('' + quoterID + ' is now following collection ' + collectionID);
			
			if (res) res.send({'OK':'Successfully inserted to following'});
			callback();
		}
	});
}

var appendToFollowing = function(collection, quoterID, collectionOwnerID, collectionID, res, callback) {
	collection.update({'_id': new BSON.ObjectID(quoterID), 'following.ownerID' : collectionOwnerID}, {$addToSet : {'following.$.collections' : collectionID}}, {safe:true}, function(err, result) {
		if (err) {
			logger.error(err);
			console.log('Error updating collections ' + err);
			if (res) res.send({'error':'An error has occurred'});
		} else {
			console.log('' + quoterID + ' is now following ' + collectionID);
			
			if (res) res.send({'OK':'Successfully updated following collections'});
			callback();
		}
	});
}

var unfollowCollectionTask = function(colName, id, collectionObj, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.update({'_id': new BSON.ObjectID(id), 'following.ownerID' : collectionObj.ownerID}, {$pull : {'following.$.collections' : collectionObj._id}}, {safe:true}, function(err, result) {
				console.log("[unfollowCollectionTask]: "+ colName + " " + id + " " + collectionObj.ownerID);
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log("Collection unfollowed successfully", colName, id, JSON.stringify (collectionObj));
					unfollowQuoter(collection, id, collectionObj.ownerID, collectionObj._id, res, callback);
				}
			});
		});
	};
}

// Helper method: Check if following.collections array is empty. If so, unfollow the quoter
var unfollowQuoter = function(collection, quoterID, collectionOwnerID, collectionID, res, callback) {
	collection.findOne({'_id': new BSON.ObjectID(quoterID), 'following.ownerID' : collectionOwnerID}, function(err, item) {
		if (item != null) {
			var followedQuoters = item.following;
			for (var i = 0; i < followedQuoters.length; i++) {
				var followedQuoter = followedQuoters[i];
				if (followedQuoter.ownerID == collectionOwnerID) {
					var followedCollections = followedQuoter.collections;
					if (followedCollections.length == 0) {
						collection.update({'_id': new BSON.ObjectID(collectionOwnerID)}, {$pull : {followedBy : quoterID}}, {safe:true}, function(err, result) {
							if (err) {
								logger.error(err);
								if (res) res.send({'error':'An error has occurred'});
							} else {
								console.log(quoterID + ' unfollowed quoter successfully' + collectionOwnerID);

								if (res) res.send({'OK':'Successfully unfollowed quoter'});
								callback();
							}
						});
					}
					else {
						if (res) res.send({'OK':'Still following quoter'});
						callback();
					}
				}
			}
		}
		else {
			if (res) res.send({'Error':'Couldnt find quoter'});
			callback();
		}
	});
}

// var followQuoterTask = function(colName, id, collectionObj, res) {

// }

var insertTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.insert(payload, {safe:true}, function(err, result) {
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('Successfully inserted record: ' + JSON.stringify(result[0]));
					if (res) res.send(result[0]);
					results = [];
					results.push(result[0]);
					callback();
				}
			});
		});
	};
}

var insertQuoterTask = function(colName, id, payload, res){
	return function(callback) {
		db.collection(colName, function(err, collection) {
			console.log("[insertQuoterTask]");
			collection.insert(payload, {safe:true}, function(err, result) {
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('Successfully inserted quoter: ' + JSON.stringify(result[0]));
					if (res) res.send(result[0]);
					results = [];
					results.push(result[0]);
					callback();
				}
			});
		});
	};
}

var addCollectionToQuoterTask = function(colName, id, payload, res){
	return function(callback) {
		var collectionObj = results.shift();
		db.collection(colName, function(err, collection) {
			collection.update({'_id': new BSON.ObjectID(id)}, {$addToSet : {collections : collectionObj._id}}, {safe:true}, function(err, result) {
				console.log("[addCollectionToQuoterTask]");
				if (err) {
					logger.error(err);
					console.log('Error updating quoter ' + err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('' + result + ' document(s) updated with ' + JSON.stringify(collectionObj));
					if (res) res.send(collectionObj);
					callback();
				}
			});
		});
	};
}

var removeCollectionFromQuoterTask = function(colName, id, payload, res){
	return function(callback) {
		var collectionObj = payload;
		db.collection(colName, function(err, collection) {
			collection.update({'_id': new BSON.ObjectID(id)}, {$pull : {collections : new BSON.ObjectID(collectionObj._id)}}, {safe:true}, function(err, result) {
				console.log("[removeCollectionFromQuoterTask]");
				if (err) {
					logger.error(err);
					console.log('Error updating quoter ' + err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('' + result + ' document(s) updated with ' + JSON.stringify(collectionObj));
					if (res) res.send(collectionObj);
					callback();
				}
			});
		});
	};
}


var addQuoteToCollectionTask = function(colName, id, payload, res){
	return function(callback) {
		var quoteObj = results.shift();
		db.collection(colName, function(err, collection) {
			collection.update({'_id': new BSON.ObjectID(id)}, {$addToSet : {quotes : quoteObj._id}}, {safe:true}, function(err, result) {
				console.log("[addQuoteToCollectionTask]");
				if (err) {
					logger.error(err);
					console.log('Error updating collection ' + err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('' + result + ' document(s) updated with ' + JSON.stringify(quoteObj));
					results.push(quoteObj);
					if (res) res.send(quoteObj);
					callback();
				}
			});
		});
	};
}

var pullQuoteFromCollectionTask = function(colName, id, payload, res){
	return function(callback) {
		var quoteObj = payload;
		db.collection(colName, function(err, collection) {
			collection.update({'_id': new BSON.ObjectID(id)}, {$pull : {quotes : new BSON.ObjectID(quoteObj._id)}}, {safe:true}, function(err, result) {
				console.log("[pullQuoteFromCollectionTask]");
				if (err) {
					logger.error(err);
					console.log('Error updating collection ' + err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('' + result + ' document(s) updated with ' + JSON.stringify(quoteObj));
					results.push(quoteObj);
					if (res) res.send(result[0]);
					callback();
				}
			});
		});
	};
}

var addQuoteToAuthorTask = function(colName, id, payload, res){
	return function(callback) {
		var quoteObj = payload;
		db.collection(colName, function(err, collection) {
			console.log("[addQuoteToAuthorTask]");
			// If there's an existing author
			var author = results.shift();
			if (author) {
				console.log('Successfully found author: ' + author._id);
				collection.update({'_id': new BSON.ObjectID(author._id)}, {$addToSet : {quotes : quoteObj._id}}, {safe:true}, function(err, result) {
					if (err) {
						logger.error(err);
						console.log('Error updating authors ' + err);
						if (res) res.send({'error':'An error has occurred'});
					} else {
						console.log('' + result + ' document(s) updated with ' + JSON.stringify(result[0]));
						if (res) res.send(result[0]);
						callback();
					}
				});
			}
			// If the author doesn't exist
			else {
				collection.insert({name: quoteObj.author, quotes :[quoteObj._id]}, {safe:true}, function(err, result) {
					if (err) {
						logger.error(err);
						console.log('Error inserting authors ' + err);
						if (res) res.send({'error':'An error has occurred'});
					} else {
						console.log('' + result + ' document(s) inserted with ' + JSON.stringify(result[0]));
						if (res) res.send(result[0]);
						callback();
					}
				});
			}
				
		});
	};
}

var addQuoteToDailyQuoteTask = function(colName, id, payload, res){
	return function(callback) {
		// var quoteObj = payload;
		db.collection(colName, function(err, collection) {
			console.log("[addQuoteToDailyQuote] Adding: ", JSON.stringify(payload), colName);
			// If there's an existing daily quote
			var dailyQuote = results.shift();
			if (dailyQuote) {
				console.log('Successfully found daily quote: ' + dailyQuote._id);
				collection.update({'_id': new BSON.ObjectID(dailyQuote._id)}, {$inc : {popularity : payload.point}}, {safe:true}, function(err, result) {
					if (err) {
						logger.error(err);
						console.log('Error updating authors ' + err);
						if (res) res.send({'error':'An error has occurred'});
					} else {
						console.log('' + result + ' document(s) updated with ' + JSON.stringify(result[0]));
						if (res) res.send(result[0]);
						callback();
					}
				});
			}
			// If the daily quote doesn't exist
			else {
				collection.insert({quoteID: payload._id, creationDate : payload.creationDate, popularity : 1}, {safe:true}, function(err, result) {
					if (err) {
						logger.error(err);
						console.log('Error inserting daily quote ' + err);
						if (res) res.send({'error':'An error has occurred'});
					} else {
						console.log('' + result + ' document(s) inserted with ' + JSON.stringify(result[0]));
						if (res) res.send(result[0]);
						callback();
					}
				});
			}
				
		});
	};
}

var requoteTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.update({'_id': new BSON.ObjectID(id)}, {$addToSet : {quotes : new BSON.ObjectID(payload._id)}}, {safe:true}, function(err, result) {
				console.log("[requoteTask] Updating", id, JSON.stringify(payload), " in ", colName);
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('' + result[0] + ' document(s) updated with id ' + id);

					if (res) res.send({'OK':'Successfully updated record'});
					callback();
				}
			});
		});
	};
}

var removeQuoteFromDailyQuoteTask = function(colName, id, payload, res){
	return function(callback) {
		// var quoteObj = payload;
		db.collection(colName, function(err, collection) {
			console.log("[removeQuoteFromDailyQuoteTask] Removing: ", JSON.stringify(payload), colName);
			// If popularity of the quote is greater 1
			var dailyQuote = results.shift();
			if (dailyQuote) {
				if (dailyQuote.popularity > 1) {
					collection.update({'_id': new BSON.ObjectID(dailyQuote._id)}, {$inc : {popularity : payload.point}}, {safe:true}, function(err, result) {
						if (err) {
							logger.error(err);
							console.log('[removeQuoteFromDailyQuoteTask] Error updating authors ' + err);
							if (res) res.send({'error':'An error has occurred'});
						} else {
							console.log('' + result + ' document(s) updated with ' + JSON.stringify(result[0]));
							if (res) res.send(result[0]);
							callback();
						}
					});
				}
				// If popularity of the quote is 1
				else {
					collection.remove({'_id': new BSON.ObjectID(dailyQuote._id)}, {safe:true}, function(err, result) {
						if (err) {
							logger.error(err);
							console.log('Error removing daily quote ' + err);
							if (res) res.send({'error':'An error has occurred'});
						} else {
							console.log('' + result + ' document(s) remove');
							if (res) res.send(result[0]);
							callback();
						}
					});
				}
			}
			else {
				res.send("Not existed in DailyQuote");
				callback();
			}
		});
	};
}

var addQuoteToMyBoardTask = function(colName, id, payload, res){
	return function(callback) {
		var boardObj = results.shift();
		if (boardObj == null) {
			db.collection(colName, function(err, collection) {
				console.log("[addQuoteToMyBoardTask] adding: ", JSON.stringify(payload), colName);
				collection.insert({'quoterID' : id, 'creationDate' : payload.creationDate, 'quoteID' : new BSON.ObjectID(payload._id)}, {safe:true}, function(err, result) {
					if (err) {
						logger.error(err);
						if (res) res.send({'error':'An error has occurred'});
					} else {
						if (res) res.send(result[0]);
						if (callback) callback();
					}
				});
			});
		}
		else {
			if (res) res.send("Done");
			if (callback) callback();
		}
	};
}

var removeQuoteFromMyBoardTask = function(colName, id, payload, res){
	return function(callback) {
		var quoteObj = payload;
		db.collection(colName, function(err, collection) {
			console.log("[removeQuoteFromMyBoardTask] adding: ", JSON.stringify(quoteObj), colName);
			collection.remove({'quoterID' : id, 'quoteID' : new BSON.ObjectID(quoteObj._id)}, {safe:true}, function(err, result) {
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					if (res) res.send(result[0]);
					if (callback) callback();
				}
			});
		});
	};
}

var addQuoteToBoardsTask = function(colName, id, payload, res){
	return function(callback) {
		var quoteObj = payload;
		db.collection(colName, function(err, collection) {
			console.log("[addQuoteToBoard]: Adding quote " + JSON.stringify(quoteObj) + " to " + colName);
			var collectionObj = results.shift();
			// to be returned with response to device after addition is complete
			results = [];
			results.push(quoteObj); 
			// If the collection is not followed by anyone, just insert to my own board
			if (collectionObj.followedBy.length == 0) {
				// Insert to the quoter's own board
				db.collection(colName, insertBoard(quoteObj.quoterID, new BSON.ObjectID(quoteObj._id), quoteObj.creationDate, callback, res));
			}
			else {
				// Insert to the my own board
				db.collection(colName, insertBoard(quoteObj.quoterID, new BSON.ObjectID(quoteObj._id), quoteObj.creationDate, null, null));
				// Insert to all followers' boards
				for (var i = 0; i < collectionObj.followedBy.length; i++) {									
					console.log("[addQuoteToBoards]: Adding to " + collectionObj.followedBy[i] + " s board");

					if (i == collectionObj.followedBy.length - 1) {
						db.collection(colName, insertBoard(collectionObj.followedBy[i], new BSON.ObjectID(quoteObj._id), quoteObj.creationDate, callback, res));
					}
					else {
						db.collection(colName, insertBoard(collectionObj.followedBy[i], new BSON.ObjectID(quoteObj._id), quoteObj.creationDate, null, null));
					}
				}
			}
		});
	};
}

// helper for adding boards of multiple followers

var insertBoard = function(qtid, qid, date, callback, res) {
		return function(err, boards) {
			boards.insert({'quoteID' : qid, 'creationDate' : date, 'quoterID' : qtid}, {safe:true}, function(err, result) {
				console.log("[insertBoard]");
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('' + result + ' document(s) updated with quote id' + qid);
					if (res) {
						var quoteObj = results.shift();
						res.send(quoteObj);
					} 
					if (callback) callback();
				}
			});
	};
}

var removeTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.remove({'_id': new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
				console.log("[removeTask]");
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('Successfully removed record: ' + JSON.stringify(result));
					if (res) res.send(result[0]);
					callback();
				}
			});
		});
	};
}


var pullCollectionFromQuotesTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			var collectionObj = payload;
			var quoteArray = collectionObj.quotes;
			if (quoteArray.length == 0) {
				callback();
			}
			else {
				for (var i = 0; i < quoteArray.length; i++) {
					if (i == quoteArray.length - 1)
						db.collection(colName,  pullCollectionFromQuote(collection, quoteArray[i], id, callback));
					else
						db.collection(colName,  pullCollectionFromQuote(collection, quoteArray[i], id, null));
				}
			}
		});
	}
}

// Helper method: Pull collection ID from quotes.collections table
 var pullCollectionFromQuote = function(collection, qid, cid, callback) {
	collection.update({'_id': new BSON.ObjectID(qid)}, { $pull : { collections : cid}}, {safe:true}, function(err, result2) {
		if (err) {
			logger.error(err);
			console.log('Error updating collections: ' + err);
			if (res) res.send({'error':'An error has occurred'});
		} else {
			console.log('' + result2 + ' document(s) updated with quote id' + qid + " " + cid);
			if (callback) callback();
		}
	});
}

var pullCollectionFromFollowingQuotersTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			var collectionObj = payload;
			var followedByArray = collectionObj.followedBy;
			if (followedByArray.length == 0) {
				callback();
			}
			else {
				for (var i = 0; i < followedByArray.length; i++) {
					if (i == followedByArray.length - 1)
						db.collection(colName,  pullCollectionFromFollower(collection, followedByArray[i], collectionObj.ownerID, collectionObj._id, callback));
					else
						db.collection(colName,  pullCollectionFromFollower(collection, followedByArray[i], collectionObj, null));
				}
			}
		});
	}
}

// Helper method: Pull collection ID from quotes.collections table
 var pullCollectionFromFollower = function(collection, qtid, oid, cid, callback) {
	collection.update({'_id': new BSON.ObjectID(qtid), 'following.ownerID' : oid}, { $pull : {'following.$.collections' : cid}}, {safe:true}, function(err, result) {
		if (err) {
			logger.error(err);
			console.log('Error updating quoters following: ' + err);
			if (res) res.send({'error':'An error has occurred'});
		} else {
			console.log('' + result + ' document(s) updated with quote id' + qtid + " " + oid + " " + cid);
			if (callback) callback();
		}
	});
}

var getCommentsTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.aggregate({$match : {_id : new BSON.ObjectID(id)}}, {$unwind : '$comments'}, {$sort : {creationDate : 1}}, {$project : {comments : 1}}, function(err, item) {
				console.log("[getCommentsTask] : Finding " + id + " in " + colName);
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('Successfully found record: ' + JSON.stringify(item));
					results = []; //nullify the results array
					results.push(item);
					if (res) {
						res.send(item);
					}
					callback();
				}
			});
		});
	};
}
/*
Steps:
1. Find out if the originator has triggered the event with the target (quote, colleciton or quoter) of a particular quoter before
2. If it hasn't, then continue, otherwise exit.
3. Find out how many unread notifications for a particular quoter are there, then increment badge number by 1
4. Finally, insert to notifications table and send out the push notification to APN

*/
var sendNotificationTask = function(colName, id, payload, res) {
	return function(callback) {
		var notificationObj = payload;
		db.collection(colName, function(err, collection) {
			//find out targetID
			var targetID;
			// Case 1 or 5 where there are mutiple targetIDs
			if (notificationObj.event == 1 || notificationObj.event == 5)
				targetID = notificationObj.targetID[0];
			else
				targetID = notificationObj.targetID;

			collection.find({'originatorID' : notificationObj.originatorID, 'event' : notificationObj.event, 'targetID' : targetID, 'quoterID' : notificationObj.quoterID}).toArray(function(err, items) {
				console.log("[sendNotificationTask] " + JSON.stringify({'originatorID' : notificationObj.originatorID, 'event' : notificationObj.event, 'targetID' : targetID, 'quoterID' : notificationObj.quoterID}));
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} 
				else {
					if (items.length != 0) {
						console.log('Already sent quoter notification, no need to resend');
						if (res) res.end();
					}
					else {
						collection.find({'quoterID' : notificationObj.quoterID, 'read' : 0}).toArray(function(err, unReads) {		
							notificationObj['badge'] = unReads.length + 1;
							collection.insert(notificationObj, {safe:true}, function(err, result) {
								if (err) {
									logger.error(err);
									if (res) res.send({'error':'An error has occurred'});
								} else {
									console.log('Successfully sent notification: ' + JSON.stringify(result[0]));
									notifications.send(notificationObj);
									if (res) res.send(result[0]);
								}
							});
						});
					}
					callback();
				}
			});
		});
	};
}
/*
Steps:
1. Find out who the followers of the collection
2. Send notification to each of the followers
*/

var sendNotificationToCollectionFollowersTask = function(colName, id, payload, res) {
	return function(callback) {
		var notificationObj = payload;
		var quoteObj = results[0];
		var collectionID = notificationObj.targetID;
		db.collection('collections', function(err, collection) {
			collection.findOne({'_id': new BSON.ObjectID(collectionID)},function(err, item) {
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} 
				else {
					// console.log('found item' + JSON.stringify(item));
					if (!item) return;
					var followedBy = item.followedBy;
					db.collection('notifications', function(err, collection) {
						for (var i = 0; i < followedBy.length; i++) {
							console.log('1. index ', i);
							notificationObj.targetID = [quoteObj._id, collectionID]; // add target ID here 
							if (i == followedBy.length - 1)
								sendNotificationToFollower(collection, notificationObj, followedBy[i], callback);
							else
								sendNotificationToFollower(collection, notificationObj, followedBy[i], null);
						}
					});
				}
			});
		});
	};
}

var sendNotificationToQuoterFollowersTask = function(colName, id, payload, res) {
	return function(callback) {
		var notificationObj = payload;
		var collectionObj = results[0];
		var originatorID = notificationObj.originatorID;
		db.collection('quoters', function(err, collection) {
			collection.findOne({'_id': new BSON.ObjectID(originatorID)},function(err, item) {
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} 
				else {
					if (!item) return;
					// console.log('found item' + JSON.stringify(item));
					var followedBy = item.followedBy;
					db.collection('notifications', function(err, collection) {
						for (var i = 0; i < followedBy.length; i++) {
							console.log('1. index ', i);
							notificationObj.targetID = collectionObj._id; // add target ID here 
							if (i == followedBy.length - 1)
								sendNotificationToFollower(collection, notificationObj, followedBy[i], callback);
							else
								sendNotificationToFollower(collection, notificationObj, followedBy[i], null);
						}
					});
				}
			});
		});
	};
}

// Helper method: Pull collection ID from quotes.collections table
var sendNotificationToFollower = function(collection, notificationObj, quoterID, callback) {
 	console.log('2. invoke ', quoterID);
	collection.find({'quoterID' : quoterID, 'read' : 0}).toArray(function(err, unReads) {		
		console.log('3. finding ', quoterID);
		collection.insert({'quoterID' : quoterID,
						   'originatorID' : notificationObj.originatorID,
						   'originatorName' : notificationObj.originatorName,
						   'creationDate' : notificationObj.creationDate,
						   'event' : notificationObj.event,
						   'read' : notificationObj.read,
						   'targetID' : notificationObj.targetID,
						   'targetContent' : notificationObj.targetContent,
						   'badge' : unReads.length + 1
							}, {safe:true}, function(err, result) {
			console.log('inserting', notificationObj);
			if (err) {
				logger.error(err);
			} else {
				console.log('Successfully sent notification: ' + JSON.stringify(result[0]));
				notifications.send(result[0]);
				if (callback) callback();
			}
		});
	});
}

/*
Update the read status of all notifications for a particular quoter 
*/
var updateNotificationsTask = function(colName, id, payload, res) {
	return function(callback) {
		var notificationObj = payload;
		db.collection(colName, function(err, collection) {
			collection.update({'quoterID': id}, payload, {multi:true}, function(err, result) {
				console.log("[updateNotificationsTask] update notifications of quoterID " + id);
				if (err) {
					logger.error(err);
					if (res) res.send({'error':'An error has occurred'});
				} 
				else {
					console.log('' + result + ' document(s) updated with id ' + id);
					if (res) res.send(result);
					callback();
				}
			});
		});
	};
}
var actions = {	"update" : updateTask, 
				"insert" : insertTask, 
				"insertQuoter" : insertQuoterTask, 
				"remove": removeTask, 
				"findOne" : findOneTask, 
				"findOneByAttr" : findOneByAttrTask,
				"findAllByAttr" : findAllByAttrTask,
				"findAll" : findAllTask,
				"textSearch" : textSearchTask,
				"indexSearch" : indexSearchTask,
				"pullCollectionFromQuotes" : pullCollectionFromQuotesTask,
				"pullCollectionFromFollowingQuoters" : pullCollectionFromFollowingQuotersTask,
				"addCollectionToQuoter" : addCollectionToQuoterTask,
				"removeCollectionFromQuoter" : removeCollectionFromQuoterTask,
				"addQuoteToCollection" : addQuoteToCollectionTask,
				"pullQuoteFromCollection" : pullQuoteFromCollectionTask,
				"addQuoteToAuthor" : addQuoteToAuthorTask,
				"addQuoteToDailyQuote" : addQuoteToDailyQuoteTask,
				"addQuoteToMyBoard" : addQuoteToMyBoardTask,
				"removeQuoteFromMyBoard" : removeQuoteFromMyBoardTask,
				"requote" : requoteTask,
				"removeQuoteFromDailyQuote" : removeQuoteFromDailyQuoteTask,
				"addQuoteToBoards" : addQuoteToBoardsTask,
			    "followCollection" : followCollectionTask,
			    "unfollowCollection" : unfollowCollectionTask,
			    "findLatest" : findLatestTask, 
			    "findLatestBoard" : findLatestBoardTask, // version 3.0
			    "findBoard" : findBoardTask,
			    "findNewer" : findNewerTask,
			    "findNewerBoard" : findNewerBoardTask, // version 3.0
			    "findOlder" : findOlderTask,
			    "findOlderBoard" : findOlderBoardTask, // version 3.0
			    "findLatestPopular" : findLatestPopularTask,
			    "findDistinct" : findDistinctTask,
			    "getComments" : getCommentsTask,
			    "findRecommended" : findRecommendedTask,
			    "findOneConditional" : findOneConditionalTask, // version 3.0
			    "sendNotification" : sendNotificationTask,
			    "sendNotificationToCollectionFollowers" : sendNotificationToCollectionFollowersTask,
			    "sendNotificationToQuoterFollowers" : sendNotificationToQuoterFollowersTask,
			    "updateNotifications" : updateNotificationsTask
				};

var results = []; //results of accomplished task

// Perform mungo db operations
 exports.performDBOperation = function(action, colName, id, payload, res) {
 	// console.log("*************Performed Operation " + action + "*************");
 	var task = actions[action];
 	console.log(task);
 	if (!task) throw "No such task";
 	return task(colName, id, payload, res);
 }

 exports.performConditionalSearch = function(action, colName, id, payload, req, res) {
 	// console.log("*************Performed Operation " + action + "*************");
 	var task = actions[action];
 	console.log(task);
 	if (!task) throw "No such task";
 	return task(colName, id, payload, req, res);
 }

 exports.performDBSearch = function(action, colName, query, output, sort, num, res) {
 	// console.log("*************Performed DB Search " + action + "*************");
 	var task = actions[action];
 	console.log(task);
 	if (!task) throw "No such task";
 	return task(colName, query, output, sort, num, res);
 }