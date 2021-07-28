// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var IngredientTypesSchema = new mongoose.Schema({

	ingredientTypeID: {
		type: Number,
		required: true
	},

	ingredientTypeName: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('IngredientTypes', IngredientTypesSchema);