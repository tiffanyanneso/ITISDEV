// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishClassification = require('../models/DishClassificationModel.js');

const DishStatus = require('../models/DishStatusModel.js');


const MenuController = {

	getMenu: function (req, res) {

		var menu = [];
		var statuses = [];
		var classifications = [];
		var dishes = [];

		var statusProjection = '_id status'; 	
		db.findMany (DishStatus, {}, statusProjection, function(result3) {

			for (var i=0; i<result3.length; i++) {

				var status = {
					_id: result3[i]._id,
					status: result3[i].status
				};
				statuses.push( status );
			}

			var classProjection = '_id classification'; 	
			db.findMany (DishClassification, {}, classProjection, function(result) {
				
				for (var i=0; i<result.length; i++) {

					var classification = {
						_id: result[i]._id,
						classification: result[i].classification
					};
					classifications.push( classification );
				}

				var dishProjection = '_id dishName dishPrice dishStatus dishClassification';
				db.findMany (Dishes, {}, dishProjection, function(result2) {

					for (var j =0; j<result2.length; j++) {

						var status = "Out of Stock";
						for(var i=0; i<statuses.length; i++){
							if(result2[j].dishStatus == statuses[i]._id )
								status = statuses[i].status;
						}

						var dish = {
							_id: result2[j]._id,
							dishName: result2[j].dishName,
							dishPrice: result2[j].dishPrice,
							dishStatus: status,
							dishClassification: result2[j].dishClassification
						};

						dishes.push( dish );
					}

					for (var i =0; i < classifications.length; i++){

						var temp = {
							classification: classifications[i].classification
						};

						menu.push ( temp );

						for (var j =0; j < dishes.length; j++){

							if( classifications[i]._id == dishes[j].dishClassification){
								dishes[j].dishClassification =  classifications[i].classification;
								menu.push( dishes[j] );
							}
						}
					}

					res.render('menu', {menu});		
				});
			});
		});
	},

	getViewDish: function (req, res) {
		var systemID = req.params.systemID;
		var statuses = [];

		// Get "Available" and "Unavailable" status options to populate dropdown
		db.findMany(DishStatus, {}, '_id status', function(result) {

			for (var i = 0; i < result.length; i++) {
				var status = {
					_id: result[i]._id,
					status: result[i].status
				};

				if (status.status == "Available" || status.status == "Unavailable")
					statuses.push(status);
			}

			var projection = 'dishName dishPrice dishStatus dishClassification';

			// Get dish information based on the _id/systemID
			db.findOne (Dishes, {_id: systemID}, projection, function(result2) {
				var dish = {
					systemID: result2._id,
					dishName: result2.dishName,
					dishPrice: parseFloat(result2.dishPrice).toFixed(2),
					dishStatusID: result2.dishStatus,
					dishStatus: "Status",
					dishClassificationID: result2.dishClassification,
					dishClassification : "Classification"
				};

				// Get status of dish based on its _id
				db.findOne(DishStatus, {_id: dish.dishStatusID}, 'status', function(result3) {

					dish.dishStatus = result3.status;

					// Get classification of dish based on its _id
					db.findOne(DishClassification, {_id: dish.dishClassificationID}, 'classification', function(result4) {

						dish.dishClassification = result4.classification;

						//console.log(dish);
						//console.log(statuses);
						res.render('viewDish', {dish, statuses});
					});
				});
			});
		});
	},

	updateDishStatus: function (req, res) {
		db.updateOne(Dishes, {_id: req.body.dishID}, {dishStatus: req.body.dropdownValID}, function(flag) {
			if (flag) {

			}
		});
	}

};


module.exports = MenuController;