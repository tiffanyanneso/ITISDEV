
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const DishClassification = require('../models/DishClassificationModel.js');

//import models

const addNewDishController = {

    getAddNewDish: function (req, res) {
        /*var projection1 = '_id classification';
        var classifications = [];

        var dishClass = {
			classification: "Drink",
        };

        db.insertOne (DishClassification, dishClass, function (flag) {
			if (flag) {

			} 
        });*/

        db.findMany(DishClassification, {}, projection1, function (result) {
            //console.log(result);
			for (var i=0; i<result.length; i++) {
				var classification = {
					_id: result[i]._id,
					name: result[i].classification,
				};
				classifications.push(classification);
            }
            res.render('addNewDish', {classifications});
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