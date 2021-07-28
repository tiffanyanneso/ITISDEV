// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var PurchasesSchema = new mongoose.Schema({

	purchaseID: {
		type: Number,
		required: true
	},

	dateBought: {
		type: Date,
		required: true
	},

	total: {
		type: Number,
		required: true
	},

	employeeID: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('Purchases', PurchasesSchema);