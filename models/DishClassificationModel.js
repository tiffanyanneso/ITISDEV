// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var DishClassificationSchema = new mongoose.Schema({

	dishClassificationID: {
		type: Number,
		required: true
	},

	classification: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('DishClassification', DishClassificationSchema);