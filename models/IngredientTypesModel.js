// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var IngredientTypesSchema = new mongoose.Schema({

	ingredientType: {
		type: String,
		required: true
	},

	multiplier: {
		type: Number,
		required: false
	}

});

module.exports = mongoose.model('IngredientTypes', IngredientTypesSchema);