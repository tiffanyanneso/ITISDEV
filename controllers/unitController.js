
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Units = require('../models/UnitsModel.js');

const Conversion = require('../models/ConversionModel.js');

const unitController = {
	getUnitConverter: function (req, res) {
		res.render('unitConversion');
	},

	saveUnit: function (req, res) {
		var conversion = {
			unitA: req.body.unitA,
			unitB: req.body.unitB,
			ratio: req.body.ratio,
			operator: req.body.operator
		};

		var operator1;
		if (conversion.operator == "*")
			operator1 = '/';
		else
			operator1 = '*'

		var conversion1 = {
			unitA: req.body.unitB,
			unitB: req.body.unitA,
			ratio: req.body.ratio,
			operator:operator1
		}

		db.findOne(Units, {unit:conversion.unitA}, 'unit', function(result) {
			//unit does not exist in db
			if (result==null) {
				db.insertOne (Units, {unit:conversion.unitA}, function(flag) {
					if (flag) { }
				});
			}
		});

		db.findOne(Units, {unit: conversion.unitB}, 'unit', function (result){
			if (result==null) {
				db.insertOne (Units, {unit:conversion.unitB}, function(flag) {
					if (flag) { }
				});
			}
		});

		//insert conversion from unitA to unitB
		db.insertOne (Conversion, conversion, function (flag){
			if (flag) { }
		})

		//insert conversion from unitB to unitA
		db.insertOne (Conversion, conversion1, function (flag){
			if (flag) { }
		})
	}

};

module.exports = unitController;