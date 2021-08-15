// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishClassification = require('../models/DishClassificationModel.js');


const MenuController = {

	getMenu: function (req, res) {

		var projection = '_id classification'; 	
		var menu = [];
		var classifications = [];


		db.findMany (DishClassification, {}, projection, function(result) {
			
			for (var i=0; i<result.length; i++) {

				var classification = {
					_id: result[i]._id,
					classification: result[i].classification
				};
				classifications.push( classification );
				//menu.push( result[i].classification );
			}

			var dishProjection = '_id dishName dishPrice dishStatus dishClassification';

				db.findMany (Dishes, {}, dishProjection, function(result2) {

					var dishes = [];

					for (var j =0; j<result2.length; j++) {

						var dish = {
							_id: result2[j]._id,
							dishName: result2[j].dishName,
							dishPrice: result2[j].dishPrice,
							dishStatus: result2[j].dishStatus,
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
	},

};


module.exports = MenuController;