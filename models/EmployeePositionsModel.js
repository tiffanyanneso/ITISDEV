// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var EmployeePositionsSchema = new mongoose.Schema({

	positionID: {
		type: Number,
		required: true
	},

	title: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('EmployeePositions', EmployeePositionsSchema);