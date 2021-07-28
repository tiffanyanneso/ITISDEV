// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var ShrinkageSchema = new mongoose.Schema({

	discrepancyID: {
		type: Number,
		required: true
	},

	ingredientID: {
		type: String,
		required: true
	},

	stockID: {
		type: String,
		required: true
	},

	date: {
		type: Date,
		required: true
	},

	systemCount: {
		type: Number, 
		required:true
	},

	manualCount: {
		type: Number,
		required: true
	},

	reason: {
		type: String, 
		required:true
	},

	employeeID: {
		type: Number, 
		required:true
	}

});

module.exports = mongoose.model('Shrinkage', ShrinkageSchema);