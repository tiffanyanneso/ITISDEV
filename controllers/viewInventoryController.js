
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Ingredients = require('../models/IngredientsModel.js');

const Stock = require('../models/StockModel.js');

//import models

const viewInventoryController = {

	//render existing inventory list
	getInventory: function (req, res) {
		var projection = '_id ingredientID ingredientName ingredientType unitMeasurement'; 	
		var ingredients = [];
		db.findMany (Ingredients, {}, projection, function(result) {
			
			for (var i=0; i<result.length; i++) {
				var ingredient = {
					systemID: result[i]._id,
					ingredientID: result[i].ingredientID,
					ingredientName: result[i].ingredientName,
					ingredientType: result[i].ingredientType,
					quantityAvailable: 10,
					unitMeasurement: result[i].unitMeasurement
				};
				ingredients.push(ingredient);
			}
			res.render('viewInventory', {ingredients});
		});
	},

	addIngredient: function(req, res) {
		var ingredient = {
			ingredientID: req.body.ingredientId,
			ingredientName: req.body.ingredientName,
			ingredientType: req.body.ingredientType,
			unitMeasurement: req.body.ingredientUnit,
			reorderLevel: 10
		};

		db.insertOne (Ingredients, ingredient, function (flag) {
			if (flag) { }
		});
	},

	//view individual ingredients and their stock
	getIngredient: function(req, res) {
		var projection = 'ingredientID ingredientName ingredientType unitMeasurement reorderLevel';

		//look for the ingredient
		db.findOne(Ingredients, {_id:req.params.systemID}, projection, function(result) {
			//look for stocks of the ingredient
			var ingredientDetails = result;
			var stockProjection = 'stockID ingredientID stockName quantity stockUnit';
			var stocks = [];

			db.findMany (Stock, {ingredientID:result.ingredientID}, stockProjection, function(result2) {
				for (var i=0; i<result2.length; i++) {
					var stock = {
						stockID: result2[i].stockID,
						stockName: result2[i].stockName,
						quantity: result2[i].quantity,
						stockUnit: result2[i].stockUnit
					}
					stocks.push(stock);
				}
				res.render('viewIngredient', {ingredientDetails, stocks});
			})
		});
		
		
	},

	addStock: function(req, res) {
		/*if (req.body.stockUnit != req.body.ingredientUnit) {
			console.log("need conversion");
			//insert code to convert
		}*/

		//save to stock after conversion?
		var stock = {
			stockID: req.body.stockID,
			ingredientID: req.body.ingredientID,
			stockName: req.body.stockName,
			quantity: req.body.quantity,
			stockUnit: req.body.stockUnit
		};

		db.insertOne(Stock, stock, function(flag) {
			if (flag) { }
		});	
		
	}
};

module.exports = viewInventoryController;