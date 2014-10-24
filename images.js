var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

var format = require('util').format;
var crypto = require('crypto');

exports.imageForm = function(req, res) {
  res.send('<form method="post" action="upload" enctype="multipart/form-data">'
    + '<p>Title: <input type="text" name="title" /></p>'
    + '<p>Quote: <input type="text" name="quote" /></p>'
    + '<p>Author: <input type="text" name="author" /></p>'
    + '<p>Source: <input type="text" name="source" /></p>'
    + '<p>Description: <input type="text" name="description" /></p>'
    + '<p>Collection: <input type="text" name="collection" /></p>'
    + '<p>Image: <input type="file" name="image" /></p>'
    + '<p><input type="submit" value="Upload" /></p>'
    + '</form>');
};

var fs = require('fs');

exports.findImageById = function(req, res) {
  var id = req.params.id;
  fs.readFile('./images/' + id, function(err, data) {
    if (err) {
      res.send("no such image");
      return;
    } 
    res.writeHead(200, {'Content-Type': 'image/png'});
    console.log("requesting image");
    res.end(data);
  });
};

exports.findThumbnailById = function(req, res) {
  var id = req.params.id;
  fs.readFile('./thumbnails/' + id, function(err, data) {
    // if (err) throw err; 
    if (err) {
      res.send("no such image");
      return;
    }
    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(data);
  });
};

exports.findAvatarById = function(req, res) {
  var id = req.params.id;
  fs.readFile('./avatars/' + id, function(err, data) {
    // if (err) throw err; 
    if (err) {
      res.send("no such image");
      return;
    }
    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(data);
  });
};

exports.findAll = function(req, res) {
  Queue.push(dbOperations.performDBOperation("findAll", "images", null, null, res));
  Queue.execute();
};

exports.findById = function(req, res) {
  var id = req.params.id;
  Queue.push(dbOperations.performDBOperation("findOne", "images", id, null, res));
  Queue.execute();
};

exports.textSearch = function(req, res) {
  var query = req.params.query;
  var num = req.params.num;
  console.log('Retrieving quote: ' + query + num);
  Queue.push(dbOperations.performDBSearch("textSearch", "images", {$text: {$search : query}}, {'_id': 1, 'tags' : 1, 'category' : 1, textScore: {$meta: "textScore"}}, {sort: {textScore: {$meta: "textScore"}}}, parseInt(num), res));
  Queue.execute();
};

exports.addImage = function(req, res) {
  //var collection = req.body;
  req.on("data",function(data){
    var imageString=data.toString('utf8');
    //var collection = '{"collection":"this is collection 123456","author":"Dada","description":"this is a new desc"}';
    console.log("json to be added:" + imageString);
    var imageObj = JSON.parse(imageString);
    Queue.push(dbOperations.performDBOperation("insert", "images", null, imageObj, res));
    Queue.execute();
  });
}

// Update an existing collection
exports.updateImageTags = function(req, res) {
  var id = req.params.id;
  //var collection = req.body;
  req.on("data",function(data){ 
    var imageString=data.toString('utf8');
    var imageObj = JSON.parse(imageString);
    Queue.push(dbOperations.performDBOperation("update", "images", id, {$addToSet: {tags : {$each: imageObj.tags}}}, res));
    Queue.execute();
  });
//res.end("s");
}

exports.findByCategory = function(req, res) {
  var category = req.params.category;
  console.log('Retrieving images: ' + category);
  Queue.push(dbOperations.performDBOperation("findAll", "images", null, {category : category}, res));
  Queue.execute();
};

exports.uploadToCloudinaryRequest = function(req, res) {
  var publicId = req.params.publicId;
  var now = new Date().getTime();
  var apiKey = "467978722165766";
  var secretKey = "Neq1O8y1Qm4H9BrNGvQL6_lsHLY";
  var shasum = crypto.createHash('sha1');
  shasum.update("public_id=" + publicId + "&timestamp=" + now + secretKey);
  var signature = shasum.digest('hex');
  console.log(signature);

  var responseObj = {};
  responseObj["signature"] = signature;
  responseObj["public_id"] = publicId;
  responseObj["timestamp"] = now;
  responseObj["api_key"] = apiKey;
  res.send(responseObj);
}