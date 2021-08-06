// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var PurchasedStockSchema = new mongoose.Schema({

	purchasedStockID: {
		type: Number,
		required: false
	},

	purchaseID: {
		type: Number,
		required: false
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