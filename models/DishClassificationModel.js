// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var DishClassificationSchema = new mongoose.Schema({

	classification: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('DishClassification', DishClassificationSchema);