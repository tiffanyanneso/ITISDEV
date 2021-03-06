// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var PurchasedStockSchema = new mongoose.Schema({

	purchaseID: {
		type: String,
		required: true
	},

	stockID: {
		type: String,
		required: true
	},

	unitPrice: {
		type: Number,
		required: true
	},

	count: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('PurchasedStock', PurchasedStockSchema);