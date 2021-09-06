// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var InventoryStatusSchema = new mongoose.Schema({

	status: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('InventoryStatus', InventoryStatusSchema);