// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var ConversionSchema = new mongoose.Schema({

	unitA: {
		type: String,
		required: true
	},

	unitB: {
		type: String,
		required: true
	},

	ratio: {
		type: Number,
		required: true
	},

	operator: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Conversion', ConversionSchema);