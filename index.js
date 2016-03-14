var express = require('express');
var mongoose = require('mongoose');
var util = require('util');

var User = require('./models/user');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/lpg');

var app = express();

var PORT = process.env.PORT;

function getUserByRfid(rfid, cb) {
	User.findOne({rfid: rfid}, function(err, user) {
		if (err) {
			return cb(err, null);
		}
		if (!user) {
			User.create({rfid: rfid}, function(err, user) {
				if (err) {
					return cb(err, null);
				}
				cb(null, user);
			});
		} else {
			cb(null, user);
		}
	});
}

function updateUserScore(user, pointsChange) {
	user.points = user.points + pointsChange;

	return new Promise(function(resolve, reject) {
		user.save(function(err) {
			if (err) {
				reject(err);
			} else {
				resolve(user);
			}
		});
	});
}

app.get('/', function(req, res) {
	res.send('Life Playing Game');
});

app.get('/api/user/:key', function(req, res) {
	User.findOne({key: req.params.key}, function(err, user) {
		if (err) {
			res.json(err);
		} else {
			res.json(user);
		}
	});
});

app.get('/api/score/:rfid', function(req, res) {
	getUserByRfid(req.params.rfid, function(err, user) {
		console.log('points', err, user, user.points);
		if (err) {
			res.json(err);
		} else {
			res.send("+" + user.points + "~");
		}
	});
});

app.post('/api/eat/:rfid/:type', function(req, res) {
	getUserByRfid(req.params.rfid, function(err, user) {
		if (err) {
			res.json(err);
		} else {
			var pointsChange = req.params.type === 'good' ? 100 : -100;
			updateUserScore(user, pointsChange).then(function(user) {
				res.json(user.points);
			}, function(err) {
				res.json(err);
			});
		}
	});
});

app.get('/api/steps/:key/:steps', function(req, res) {
	User.findOne({key: req.params.key}, function(err, user) {
		var pointsChange = parseInt(req.params.steps);
		function update() {
			if (pointsChange > 0) {
				updateUserScore(user, 1).then(function(user) {
					pointsChange = pointsChange - 1;
					setTimeout(update, 1000);
				}, function(err) {
					console.log('err', err);
					res.json(err);
				});
			}
		}
		setTimeout(update, 5000);
		res.json(pointsChange);
	});
});

app.listen(PORT, function(err) {
	if (err) {
		console.log('error!', err);
	}

	console.log('Listening on port ' + PORT)
});
