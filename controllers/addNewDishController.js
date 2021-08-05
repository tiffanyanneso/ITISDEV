
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js');

const Ingredients = require('../models/IngredientsModel.js');

//import models

const addNewDishController = {

    getAddNewDish: function (req, res) {
        res.render('addNewDish');
    },

    getCheckDishID: function(req, res) {
        var dishID = req.query.dishID;

        // Look for Dish ID
        db.findOne(Dishes, {dishID: dishID}, 'dishID', function (result) {
            //console.log(result);
            res.send(result);
        });
    },

    getIngredientID: function(req, res) {
        var ingredientID = req.query.ingredientID;

        // Look for Ingredient ID
        db.findOne(Ingredients, {ingredientID: ingredientID}, 'ingredientID', function (result) {
           // console.log(result);
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
			dishID: req.body.dishID,
			dishName: req.body.dishName,
			dishPrice: parseFloat(req.body.dishPrice),
			dishStatus: req.body.dishStatus,
			dishClassification: req.body.dishClassification
        };

        db.insertOne (Dishes, dish, function (flag) {
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