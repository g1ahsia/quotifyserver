var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');
var querystring = require('querystring');

var format = require('util').format;
var crypto = require('crypto');

// For manual image upload
// http://localhost:8080/imageform
// http://localhost:8080/images/:id

exports.imageForm = function(req, res) {
  res.send('<form name="input" action="http://192.168.1.40:8080/images/insert" method="post">'
+ 'Choose Category:<br>'
+ '<input type="radio" name="category" value="Art">Art<br>'
+ '<input type="radio" name="category" value="Light and Shadow">Light and Shadow<br>'
+ '<input type="radio" name="category" value="Texture and Pattern">Texture and Pattern<br>'
+ '<input type="radio" name="category" value="Nature">Nature<br>'
+ '<input type="radio" name="category" value="Sea and Sky">Sea and Sky<br>'
+ '<input type="radio" name="category" value="People">People<br>'
+ '<input type="radio" name="category" value="Flowers">Flowers<br>'
+ '<input type="radio" name="category" value="Cities and Landscapes">Cities and Landscapes<br>'
+ '<input type="radio" name="category" value="Animals">Animals<br>'
+ '<input type="radio" name="category" value="Other">Other<br>'
+ 'Tags: <input type="text" name="tags" size="70"><br>'
+ 'Author: <input type="text" name="author" size="67"><br>'
+ 'Reference URL: <input type="text" name="reference" size="57"><br>'
+ '<input type="submit" value="Submit">'
+ '</form>');
};

var fs = require('fs');

exports.findImageById = function(req, res) {
  var id = req.params.id;
  // fs.readFile('http://res.cloudinary.com/quotifyapp-com/image/upload/c_scale,h_768/' + id, function(err, data) {
  //   if (err) {
  //     res.send("no such image");
  //     return;
  //   } 
  //   res.writeHead(200, {'Content-Type': 'image/png'});
    console.log('<a href="http://res.cloudinary.com/quotifyapp-com/image/upload/c_scale,h_768/' + id + '>image here</a>');
    // res.end('<a href="http://res.cloudinary.com/quotifyapp-com/image/upload/c_scale,h_768/' + id + '>" 圖片在這</a>');
    res.end('<a href="http://res.cloudinary.com/quotifyapp-com/image/upload/c_scale,h_768/' + id + '">image here</a>');

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

exports.insertImageManually = function(req, res) {
  //var collection = req.body;
  req.on("data",function(data){
    var imageString=data.toString('utf8');
    var imageObj = querystring.parse(imageString);
    console.log("json to be added:" + JSON.stringify(imageObj));
    imageObj["tags"] = imageObj["tags"].split(", ");
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

exports.cloudinaryRequest = function(req, res) {
  var publicId = req.params.publicId;
  var now = new Date().getTime();
  var apiKey = "467978722165766";
  var secretKey = "Neq1O8y1Qm4H9BrNGvQL6_lsHLY";
  var shasum = crypto.createHash('sha1');
  shasum.update("public_id=" + publicId + "&timestamp=" + now + secretKey);
  var signature = shasum.digest('hex');

  var responseObj = {};
  responseObj["signature"] = signature;
  responseObj["public_id"] = publicId;
  responseObj["timestamp"] = now;
  responseObj["api_key"] = apiKey;
  res.send(responseObj);
}
