var mongo = require('mongodb');
var winston = require('winston');

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

		db.createIndex('quotes', {name:1, author:1}, function(err, indexName) {
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
					if (res) res.send(item);
					logger.log('info', 'findOneTask', {'_id': id});
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

var findLatestTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.find({'quoterID' : payload.quoterID}).limit(parseInt(payload.num)).sort({'_id' : -1}).toArray(function(err, item) {
				console.log("[findLatestTask] Finding latest of quoterID " + payload.quoterID);
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

var findLatestPopularTask = function(colName, id, payload, res) {
	return function(callback) {
		db.collection(colName, function(err, collection) {
			collection.find().limit(parseInt(payload.num)).sort({'popularity' : -1, '_id' : -1}).toArray(function(err, item) {
				console.log("[findLatestPopularTask] Finding latest popular");
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

var findNewerTask = function(colName, id, payload, res) {
	return function(callback) {
		var boardObj = results.shift();
		if (boardObj == null) {
			res.send(null);
			return;
		}
		db.collection(colName, function(err, collection) {
			collection.find({'quoterID' : payload.quoterID, '_id' : {"$gt" : new BSON.ObjectID(boardObj._id)}}).limit(parseInt(payload.num)).sort({'_id' : -1}).toArray(function(err, item) {
				console.log("[findNewerTask] Finding newer");
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

var findOlderTask = function(colName, id, payload, res) {
	return function(callback) {
		var boardObj = results.shift();
		if (boardObj == null) {
			res.send(null);
			return;
		}
		db.collection(colName, function(err, collection) {
			collection.find({'quoterID' : payload.quoterID, '_id' : {"$lt" : new BSON.ObjectID(boardObj._id)}}).limit(parseInt(payload.num)).sort({'_id' : -1}).toArray(function(err, item) {
				console.log("[findOlderTask] Finding older");
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
			collection.update({'_id': new BSON.ObjectID(id)}, payload, {safe:true}, function(err, result) {
				console.log("[updateTask] Updating", id, JSON.stringify(payload), " in ", colName);
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
					if (res) res.send(result[0]);
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
					if (res) res.send(result[0]);
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
					res.send(result[0]);
					callback();
				}
			});
		});
	};
}

var removeCollectionFromQuotesTask = function(colName, id, payload, res) {
	return function(callback) {
		var collection = results.shift();
		var quoteArray = collection.quotes;
		for (var i = 0; i < quoteArray.length; i++) {
			if (i == quoteArray.length - 1)
				db.collection('quotes',  pullCollections(quoteArray[i], id, callback));
			else
				db.collection('quotes',  pullCollections(quoteArray[i], id, null));
		}
	}
}

// Helper method: Pull collection ID from quotes.collections table
 var pullCollections = function(qid, cid, callback) {
		return function(err, quotes) {
			quotes.update({'_id': qid}, { $pull : { collections : cid}}, {safe:true}, function(err, result2) {
				if (err) {
					logger.error(err);
					console.log('Error updating collections: ' + err);
					if (res) res.send({'error':'An error has occurred'});
				} else {
					console.log('' + result2 + ' document(s) updated with quote id' + qid);
					if (callback) callback();
				}
			});
	};
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
					if (res) res.send(item);
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
				"removeCollectionFromQuotes" : removeCollectionFromQuotesTask,
				"addCollectionToQuoter" : addCollectionToQuoterTask,
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
			    "findBoard" : findBoardTask,
			    "findNewer" : findNewerTask,
			    "findOlder" : findOlderTask,
			    "findLatestPopular" : findLatestPopularTask,
			    "findDistinct" : findDistinctTask,
			    "getComments" : getCommentsTask
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

 exports.performDBSearch = function(action, colName, query, output, sort, num, res) {
 	// console.log("*************Performed DB Search " + action + "*************");
 	var task = actions[action];
 	console.log(task);
 	if (!task) throw "No such task";
 	return task(colName, query, output, sort, num, res);
 }