// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var DishStatusSchema = new mongoose.Schema({

	dishStatusID: {
		type: String,
		required: true
	},

	status: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('DishStatus', DishStatusSchema);