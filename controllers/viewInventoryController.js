
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Ingredients = require('../models/IngredientsModel.js');

const Stock = require('../models/StockModel.js');

const Units = require('../models/UnitsModel.js');

//import models

const viewInventoryController = {

	//render existing inventory list
	getInventory: function (req, res) {

		function getUnitName(unitId) {
			return new Promise ((resolve, reject) => {
				db.findOne (Units, {_id:unitId}, 'unit', function(result){
					if (result!="")
						resolve(result.unit);
				})
			})
		}

		async function getUnit(ingredients) {
			for (var i=0; i<ingredients.length; i++) {
				var unitName = await getUnitName (ingredients[i].unitMeasurement);
				ingredients[i].unitMeasurement = unitName;
			}

			db.findMany (Units, {}, '_id unit', function (result2) {
				var units = [];
				for (var i=0; i<result2.length; i++) {
					var unit = {
						id:result2[i]._id,
						unitName:result2[i].unit
					};
					units.push (unit);
				}
				res.render('viewInventory', {ingredients, units});
			})
		}

		var projection = '_id ingredientName ingredientType unitMeasurement'; 	
		var ingredients = [];
		db.findMany (Ingredients, {}, projection, function(result) {
			for (var i=0; i<result.length; i++) {
				var ingredient = {
					systemID: result[i]._id,
					ingredientName: result[i].ingredientName,
					ingredientType: result[i].ingredientType,
					quantityAvailable: 10,
					unitMeasurement: result[i].unitMeasurement
				};
				ingredients.push(ingredient);

				getUnit(ingredients);
			}
			
		});
	},

	addIngredient: function(req, res) {
		var ingredient = {
			ingredientName: req.body.ingredientName,
			ingredientType: req.body.ingredientType,
			quantityAvailable: 0,
			unitMeasurement: req.body.ingredientUnitVal,
			reorderLevel: 10
		};

		db.insertOne (Ingredients, ingredient, function (flag) {
			if (flag) { }
		});
	},

	//view individual ingredients and their stock
	getIngredient: function(req, res) {

		function getUnitName(unitId) {
			return new Promise ((resolve, reject) => {
				db.findOne (Units, {_id:unitId}, 'unit', function(result){
					if (result!="")
						resolve(result.unit);
				})
			})
		}

		async function getUnit(ingredientDetails, stocks) {
			ingredientDetails.unitMeasurement = await getUnitName(ingredientDetails.unitMeasurement);
			for (var i=0; i<stocks.length; i++) {
				var unitName = await getUnitName (stocks[i].stockUnit);
				stocks[i].stockUnit = unitName;
			}

			db.findMany (Units, {}, '_id unit', function (result2) {
				var units = [];
				for (var i=0; i<result2.length; i++) {
					var unit = {
						id:result2[i]._id,
						unitName:result2[i].unit
					};
					units.push (unit);
				}
				res.render('viewIngredient', {ingredientDetails, stocks, units});
			})
		}

		var projection = '_id ingredientName ingredientType quantityAvailable unitMeasurement reorderLevel';

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

				getUnit(ingredientDetails, stocks);
			});
		});
		
	},

	getCheckStockName: function (req, res) {
        db.findOne(Stock, {stockName: req.query.stockName}, 'stockName', function (result) {
            res.send(result);
        });
	},

	addStock: function(req, res) {
		db.findOne(Ingredients, {ingredientName:req.body.ingredientName}, '_id', function(result) {
			var stock = {
				stockName: req.body.stockName,
				ingredientID: result._id,
				quantity: req.body.quantity,
				stockUnit: req.body.stockUnitVal
			};

			db.insertOne(Stock, stock, function(flag) {
				if (flag) { }
			});	
		})
		
		
	}
};

module.exports = viewInventoryController;