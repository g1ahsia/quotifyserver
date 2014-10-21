var dbOperations = require('./dbOps');
var Queue = require('./taskQueue.js');

var multiparty = require('multiparty');
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

exports.uploadImage = function(req, res, next) {
  // create a form to begin parsing
  console.log("req is" + req);
  var form = new multiparty.Form();
  var image;
  var title;
  var imageFile;
  var quote;
  var type;

  form.on('error', next);
  form.on('close', function(){
      // Copy files to destination
      var source = fs.createReadStream('temp');
      var dest = "";
      // if (type == "textImage") {
      //   dest = fs.createWriteStream('./textImages/' + image.filename);
      //   source.pipe(dest);
      //   Queue.push(dbOperations.performDBOperation("update", "quotes", image.filename, {$set : {textImageURL : image.filename}}, res));
      // }
      // else if (type == "image") {
      if (type == "image") {
        dest = fs.createWriteStream('./images/' + image.filename);
        source.pipe(dest);
        Queue.push(dbOperations.performDBOperation("update", "images", image.filename, {$set : {URL : image.filename}}, res));
      }
      else if (type == "thumbnail") {
        dest = fs.createWriteStream('./thumbnails/' + image.filename);
        source.pipe(dest);
        Queue.push(dbOperations.performDBOperation("update", "images", image.filename, {$set : {URL : image.filename}}, res));
      }

      else if (type == "avatar") {
        dest = fs.createWriteStream('./avatars/' + image.filename);
        source.pipe(dest);
        Queue.push(dbOperations.performDBOperation("update", "images", image.filename, {$set : {URL : image.filename}}, res));
      }
              // }
      // add text image URL to the quote document
      
      Queue.execute();
      source.on('end', function() { /* copied */ });
      source.on('error', function(err) { /* error */ });
      // res.send(format('\nuploaded %s (%d Kb) as %s'
      // , image.filename
      // , image.size / 1024 | 0
      // , title));
      Queue.execute();
  console.log('end');
   
  });

  // form.on('field', function(name, val) {
  //   if (name !== 'quote') return;
  //   quote = val;
  //   var quoteObj = JSON.parse(quote);
  //   quoteObj['textImageURL'] = title;
    //Queue.push(dbOperations.performDBOperation("insert", "quotes", null, quoteObj, res));
    //Queue.push(dbOperations.performDBOperation("addQuoteToCollection", "collections", quoteObj.collections[0], null, res));
    
  // });

  // listen on field event for type
  form.on('field', function(name, val){
    if (name !== 'type') return;
      type = val;
      console.log("type " + type);
  });

  // listen on part event for image file
  form.on('part', function(part) {
    if (!part.filename) return;
    if (part.name !== 'image') return part.resume();
    image = {};
    image.filename = part.filename;
    image.type = part.type;
    console.log("filename " + image.filename);
    image.size = 0;
    fs.open('temp', 'w');
    imageFile = fs.createWriteStream('temp', {'flags': 'w'});
    part.on('data', function(buf) {
      image.size += buf.length;
      // console.log(image.size);
      imageFile.write(buf);
      //console.log(JSON.stringify(part));
    });
  });


  // parse the form
  form.parse(req);

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