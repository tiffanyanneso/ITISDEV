// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var EmployeesSchema = new mongoose.Schema({

	employeeID: {
		type: String,
		required: true
	},

	name: {
		type: String,
		required: true
	},

	password: {
		type: String,
		required: true
	},

	position: {
		type: String,
		required: true
	},

	email: {
		type: String, 
		required:true
	},

	phoneNumber: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('Employees', EmployeesSchema);