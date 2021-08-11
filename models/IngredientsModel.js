// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var IngredientsSchema = new mongoose.Schema({

	ingredientName: {
		type: String,
		required: true
	},

	ingredientType: {
		type: String,
		required: true
	},

	quantityAvailable: {
		type: Number,
		required: true
	},

	unitMeasurement: {
		type: String,
		required: true
	},
	reorderLevel: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('Ingredients', IngredientsSchema);