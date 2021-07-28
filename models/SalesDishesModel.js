// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var SalesDishesSchema = new mongoose.Schema({

	salesID: {
		type: Number,
		required: true
	},

	dishID: {
		type: String,
		required: true
	},

	quantity: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('SalesDishes', SalesDishesSchema);