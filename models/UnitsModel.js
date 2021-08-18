// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var UnitsSchema = new mongoose.Schema({

	unit: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Units', UnitsSchema);