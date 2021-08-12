
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const DishClassification = require('../models/DishClassificationModel.js');

const DishStatus = require('../models/DishStatusModel.js');

//import models

const addNewDishController = {

    getAddNewDish: function (req, res) {
        var projection1 = '_id classification';
        var classifications = [];

        /*
        var dishClass = {
			classification: "Drink",
        };

        db.insertOne (DishClassification, dishClass, function (flag) {
			if (flag) {

			} 
        });*/

        db.findMany(DishClassification, {}, projection1, function (result) {
            //console.log(result);
			for (var i = 0; i < result.length; i++) {
				var classification = {
					_id: result[i]._id,
					name: result[i].classification,
				};
				classifications.push(classification);
            }

            var projection2 = '_id status';
            var statuses = [];

            db.findMany(DishStatus, {}, projection2, function (result2) {
                //console.log(result2);
                for (var j = 0; j < result2.length; j++) {
                    var status = {
                        _id: result2[j]._id,
                        status: result2[j].status,
                    };
                    statuses.push(status);
                }
                res.render('addNewDish', {classifications, statuses});
            });
		});
    },

    getCheckDishName: function(req, res) {
        var dishName = req.query.dishName;

        // Look for Dish Name
        db.findOne(Dishes, {dishName: dishName}, 'dishName', function (result) {
            //console.log(result);
            res.send(result);
        });
    },

    getIngredientID: function(req, res) {
        var ingredientName = req.query.ingredientName;

        // Look for Ingredient ID
        db.findOne(Ingredients, {ingredientName: ingredientName}, '_id', function (result) {
            console.log(result);
            res.send(result);
        });
    },

    getIngredientName: function(req, res) { 
        var ingredientID = req.query.ingredientID;

        var projection = 'ingredientID ingredientName';

        db.findOne(Ingredients, {ingredientID: ingredientID}, projection, function(result) {
            res.send(result);
        });
    },

    getCheckIngredientName: function(req, res) { 
        var ingredientName = req.query.ingredientName;

        db.findOne(Ingredients, {ingredientName: ingredientName}, 'ingredientName', function(result) {
            res.send(result);
        });
    },

    getAutoIngredientName: function (req, res) {
		console.log(req.query.query);
		//$options:i denotes case insensitive searching
		db.findMany (Ingredients, {ingredientName:{$regex:req.query.query, $options:'i'}}, 'ingredientName', function (result) {
			var formattedResults = [];
			//reason for the for loop: https://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
			for (var i=0; i<result.length; i++) {
				var formattedResult = {
					label: result[i].ingredientName,
					value: result[i].ingredientName
				};
				formattedResults.push(formattedResult);
			}
			res.send(formattedResults);
		});
	},

    postAddDish: function(req, res) {
		var dish = {
			dishName: req.query.dishName,
			dishPrice: parseFloat(req.query.dishPrice),
			dishStatus: req.query.dishStatus,
			dishClassification: req.query.dishClassification
        };

        db.insertOne (Dishes, dish, function (flag) {
			if (flag) {
                db.findOne(Dishes, {dishName: dish.dishName}, '_id', function(result) {
                    res.send(result);
                });
			} 
        });

    },

    postAddOneIngredient: function(req, res) {
		var dishIngredient = {
			dishID: req.body.dishID,
			ingredientID: req.body.ingredientID,
			quantity: req.body.quantity,
			unitMeasurement: req.body.unit
        };

        db.insertOne (DishIngredients, dishIngredient, function (flag) {
			if (flag) {

			} 
        });

    },
    
    postAddIngredients: function(req, res) {
        var parsed = JSON.parse(req.body.JSONIngredients);

        db.insertMany (DishIngredients, parsed, function(flag) {
            if (flag) {

            } 
        });
    }
	
};

module.exports = addNewDishController;