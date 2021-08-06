// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var StockSchema = new mongoose.Schema({

	stockID: {
		type: String,
		required: true
	},

	ingredientID: {
		type: String,
		required: true
	},

	stockName: {
		type: String,
		required: true
	},

	quantity: {
		type: Number,
		required: true
	},

	stockUnit: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Stock', StockSchema);