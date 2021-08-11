// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var StockSchema = new mongoose.Schema({


	stockName: {
		type: String,
		required: true
	},

	ingredientName: {
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