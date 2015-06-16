var crypto = require('crypto');
var algorithm = 'aes-256-ctr',
    secretKey = 'qeN128y1Qb4H6BrNgsGvQL3_lsLLY';

 exports.encrypt = function(text) {
	var cipher = crypto.createCipher(algorithm, secretKey)
  	var crypted = cipher.update(text, 'utf8', 'hex')
  	console.log('crypted password ' + crypted);
  	crypted += cipher.final('hex');
  	return crypted;
 }

 exports.decrypt = function(text) {
  var decipher = crypto.createDecipher(algorithm, secretKey)
  var decrypted = decipher.update(text,'hex','utf8')
  decrypted += decipher.final('utf8');
  return decrypted;
}