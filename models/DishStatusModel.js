// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var DishStatusSchema = new mongoose.Schema({

	dishStatusID: {
		type: Number,
		required: true
	},

	status: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('DishStatus', DishStatusSchema);