var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
MongoClient.connect('mongodb://127.0.0.1:27017/test', function (err, db) {
    if (err) {
        throw err;
    } else {
        console.log("successfully connected to the database");
         db.collection('test', function(err, collection) {});

	      var collection = db.collection('test');
		  var doc = {mykey:1, fieldtoupdate:1};

		  collection.insert(doc, {w:1}, function(err, result) {
		    collection.update({mykey:1}, {$set:{fieldtoupdate:3}}, {w:1}, function(err, result) {});
		  });

	      collection.findOne({mykey:1}, function(err, item) {
	      	console.log("result is " + JSON.stringify(item));
		  });
    }
    // db.close();
});