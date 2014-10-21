var queue=[];

exports.push = function (argument) {
	queue.push(argument);
}

exports.execute = function () {
	queue.execute();
}

queue.execute = function () {
  if (queue.length) {
    // Pop the item in queue and pass Queue.execute as its parameter, which is a callback function that 
	// will be triggered once the item is executed
		console.log("executed");
		queue.shift()(queue.execute);
	}
  else 
    queue.last();
};

queue.last = function() {
  console.log("end");
};