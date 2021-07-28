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

	price: {
		type: Number,
		required: true
	},

	dishStatusID: {
		type: Number,
		required: true
	},

	dishClassificationID: {
		type: Number, 
		required:true
	}
});

module.exports = mongoose.model('Dishes', DishesSchema);