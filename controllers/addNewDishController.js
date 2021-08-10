
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
    
    postAddIngredients: function(req, res) {
        var parsed = JSON.parse(req.body.JSONIngredients);

        db.insertMany (DishIngredients, parsed, function(flag) {
            if (flag) {

            } 
        });
    }
	
};

module.exports = addNewDishController;