var mongoose = require('mongoose');

var ReasonSchema = new mongoose.Schema({

    reason: {
        type: String,
        required: true

    }

});

module.exports = mongoose.model('Reasons', ReasonSchema);