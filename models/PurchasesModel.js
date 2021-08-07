// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var PurchasesSchema = new mongoose.Schema({

	purchaseID: {
		type: String,
		required: false
	},

	dateBought: {
		type: String,
		required: true
	},

	total: {
		type: Number,
		required: true
	},

	employeeID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Purchases', PurchasesSchema);