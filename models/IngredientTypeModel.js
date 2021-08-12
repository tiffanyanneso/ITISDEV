// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var IngredientsSchema = new mongoose.Schema({

	ingredientType: {
		type: String,
		required: true
	}

});

module.exports = mongoose.model('IngredientTypes', IngredientTypesSchema);