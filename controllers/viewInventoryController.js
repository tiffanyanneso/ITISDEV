
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Ingredients = require('../models/IngredientsModel.js');

const Stock = require('../models/StockModel.js');

const Units = require('../models/UnitsModel.js');

//import models

const viewInventoryController = {

	//render existing inventory list
	getInventory: function (req, res) {
		var projection = '_id ingredientName ingredientType unitMeasurement'; 	
		var ingredients = [];
		db.findMany (Ingredients, {}, projection, function(result) {
			console.log(result);
			for (var i=0; i<result.length; i++) {
				var ingredient = {
					systemID: result[i]._id,
					ingredientName: result[i].ingredientName,
					ingredientType: result[i].ingredientType,
					quantityAvailable: 10,
					unitMeasurement: result[i].unitMeasurement
				};
				ingredients.push(ingredient);
			}

			db.findMany (Units, {}, 'unit', function (result2) {
				var units = [];
				for (var i=0; i<result2.length; i++) {
					var unit = {
						unit:result2[i].unit
					};
					units.push (unit);
				}
				res.render('viewInventory', {ingredients, units});
			})
			
		});
	},

	addIngredient: function(req, res) {
		var ingredient = {
			ingredientName: req.body.ingredientName,
			ingredientType: req.body.ingredientType,
			quantityAvailable: 0,
			unitMeasurement: req.body.ingredientUnit,
			reorderLevel: 10
		};

		db.insertOne (Ingredients, ingredient, function (flag) {
			if (flag) { }
		});
	},

	//view individual ingredients and their stock
	getIngredient: function(req, res) {
		var projection = 'ingredientName ingredientType quantityAvailable unitMeasurement reorderLevel';

		//look for the ingredient
		db.findOne(Ingredients, {_id:req.params.systemID}, projection, function(result) {
			//look for stocks of the ingredient
			var ingredientDetails = result;
			var stockProjection = 'stockName quantity stockUnit';
			var stocks = [];

			db.findMany (Stock, {ingredientName:result.ingredientName}, stockProjection, function(result2) {
				for (var i=0; i<result2.length; i++) {
					var stock = {
						stockName: result2[i].stockName,
						quantity: result2[i].quantity,
						stockUnit: result2[i].stockUnit
					}
					stocks.push(stock);
				}

				db.findMany (Units, {}, 'unit', function (result2) {
					var units = [];
					for (var i=0; i<result2.length; i++) {
						var unit = {
							unit:result2[i].unit
						};
						units.push (unit);
					}
					res.render('viewIngredient', {ingredientDetails, stocks, units});
				});
			});
		});
		
	},

	getCheckStockName: function (req, res) {
        db.findOne(Stock, {stockName: req.query.stockName}, 'stockName', function (result) {
            res.send(result);
        });
	},

	addStock: function(req, res) {
		var stock = {
			stockName: req.body.stockName,
			ingredientName: req.body.ingredientName,
			quantity: req.body.quantity,
			stockUnit: req.body.stockUnit
		};

		db.insertOne(Stock, stock, function(flag) {
			if (flag) { }
		});	
		
	}
};

module.exports = viewInventoryController;