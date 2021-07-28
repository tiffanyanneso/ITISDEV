// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var ConversionSchema = new mongoose.Schema({

	conversionID: {
		type: Number,
		required: true
	},

	unitA: {
		type: String,
		required: true
	},

	unitB: {
		type: String,
		required: true
	},

	ratioA: {
		type: Number,
		required: true
	},

	ratioB: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('Conversion', ConversionSchema);