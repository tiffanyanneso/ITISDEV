// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var MeasurementSchema = new mongoose.Schema({

	unitOfMeasurement: {
		type: String,
		required: true
	}

});

module.exports = mongoose.model('Measurements', MeasurementsSchema);