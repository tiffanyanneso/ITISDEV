// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var SalesSchema = new mongoose.Schema({

	salesID: {
		type: String,
		required: true
	},

	employeeID: {
		type: String,
		required: true
	},

	date: {
		type: Date,
		required: true
	},

	total: {
		type: Number,
		required: true
	},

	VAT: {
		type: Number,
		required: true
	},

	discount: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('Sales', SalesSchema);