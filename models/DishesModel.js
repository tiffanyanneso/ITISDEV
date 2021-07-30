// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var DishesSchema = new mongoose.Schema({

	dishID: {
		type: String,
		required: true
	},

	dishName: {
		type: String,
		required: true
	},

	dishPrice: {
		type: Number,
		required: true
	},

	dishStatus: {
		type: String,
		required: true
	},

	dishClassification: {
		type: String, 
		required:true
	}
});

module.exports = mongoose.model('Dishes', DishesSchema);