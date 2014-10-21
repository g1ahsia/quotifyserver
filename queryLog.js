var winston = require('winston');

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console),
		new (winston.transports.File)({filename : 'logs/main.log'})
	]
});

var options = {
	from: new Date - 24 * 60 * 60 * 1000,
	until: new Date,
	limit: 130,
	start: 0,
	order: 'asc',
	fields: ['timestamp', 'message', '_id']
};

logger.query(options, function (err, results) {
	if (err) {
		throw err;
	}
	console.log(results);
})