var express = require('express');
var mongoose = require('mongoose');
var util = require('util');

var User = require('./models/user');

mongoose.connect('mongodb://localhost/lpg');

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

app.get('/', function(req, res) {
	res.send('Life Playing Game');
});

app.get('/api/score/:rfid', function(req, res) {
	getUserByRfid(req.params.rfid, function(err, user) {
		console.log('points', err, user, user.points);
		if (err) {
			res.json(err);
		} else {
			res.json(user.points);
		}
	});
});

app.post('/api/eat/:rfid/:type', function(req, res) {
	getUserByRfid(req.params.rfid, function(err, user) {
		if (err) {
			res.json(err);
		} else {
			if (req.params.type === 'good') {
				user.points = user.points + 100;
			} else {
				user.points = user.points - 100;
			}
			user.save(function(err) {
				if (err) {
					res.json(err);
				} else {
					res.json(user.points);
				}
			});
		}
	});
});

app.listen(PORT, function(err) {
	if (err) {
		console.log('error!', err);
	}

	console.log('Listening on port ' + PORT)
});
