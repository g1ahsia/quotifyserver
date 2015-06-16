var email   = require("./node_modules/emailjs/email");
var server  = email.server.connect({
   user:    "allen@quotifyapp.com", 
   password:"mar181979", 
   host:    "smtp.gmail.com", 
   ssl:     true
});

exports.send = function(email, name, password, res) {
	if (!password) {
		console.log('3rd party login');
		res.send({"status" : "oauth"});
		return; 
	}
	server.send({
	   text:    "Hello " + name + ",\n\n You may find your password below: \n\n" + password + "\n\n Cheers, \n\n Quotify App Team", 
	   from:    "Quotify App <allen@quotifyapp.com>", 
	   to:      name + "<" + email + ">",
	   cc:      "",
	   subject: "Quotify App Password Retrieval"
	}, function(err, message) { 
		if (err) 
			console.log(err);
		else {
			console.log(message);
			res.send({"status" : "sent"}); 
		}
	});
}