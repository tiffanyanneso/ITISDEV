
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Ingredients = require('../models/IngredientsModel.js');

function IngredientsConst (ingredients) {
	this.ingredients = ingredients;
}

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
			var postIngredients = new IngredientsConst(ingredients);
			res.render('viewInventory', postIngredients);
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
			if (flag) {

			}
		});
	},

	getIngredient: function(req, res) {
		var projection = 'ingredientID ingredientName ingredientType unitMeasurement reorderLevel';
		db.findOne(Ingredients, {_id:req.params.systemID}, projection, function(result) {
			res.render('viewIngredient', result);
		});
		
	}
};

module.exports = viewInventoryController;