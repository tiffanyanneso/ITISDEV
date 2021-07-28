// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var DishIngredientsSchema = new mongoose.Schema({

	dishID: {
		type: String,
		required: true
	},

	ingredientID: {
		type: String,
		required: true
	},

	quantity: {
		type: Number,
		required: true
	},

	unitMeasurement: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('DishIngredients', DishIngredientsSchema);