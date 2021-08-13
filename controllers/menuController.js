// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishClassification = require('../models/DishClassificationModel.js');


const MenuController = {

	getMenu: function (req, res) {

		var projection = '_id classification'; 	
		var menu = [];

		/*var dish = {
			systemID: 1231,
			dishName: 'Fried Chicken',
			dishPrice: 10,
			dishStatus: 'Available',
			dishClassification: 'classification'
		};

		menu.push(dish);*/

		db.findMany (DishClassification, {}, projection, function(result) {
			
			for (var i=0; i<result.length; i++) {

				var dishProjection = '_id dishName dishPrice dishStatus';
				var classification = result[i].classification;

				db.findMany (Dishes, { dishClassification : result[i]._id }, dishProjection, function(result2) {

					for (var j=0; j<result2.length; i++) {
						var dish = {
							systemID: 1231,
							dishName: result2[j].dishName,
							dishPrice: result2[j].dishPrice,
							dishStatus: result2[j].dishStatus,
							dishClassification: classification
						};
						menu.push(dish);
					}


				});
			}
		
			res.render('menu', {menu});		
			
		});

		/*db.findMany (DishClassification, {}, projection, function(result) {
			
			for (var i=0; i<result.length; i++) {

				var classification = result[i].classification;
				var dishProjection = '_id dishName dishPrice dishStatus';

				db.findMany (Dishes, { _id : classification }, dishProjection, function(result2) {

					for (var j=0; j<result2.length; i++) {

						var dish = {
							systemID: result2[j]._id,
							dishName: result2[j].dishName,
							dishPrice: result2[j].dishPrice,
							dishStatus: result2[j].dishStatus,
							dishClassification: classification
						};

						menu.push(dish);
					}
				});
			}
			
		});*/

	},

};


module.exports = MenuController;