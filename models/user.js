var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
	rfid: String,
	points: {type: Number, default: 200}
});
