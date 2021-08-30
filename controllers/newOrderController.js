const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishClassification = require('../models/DishClassificationModel');

const DishStatus = require('../models/DishStatusModel.js');

//const DishIngredients = require('../models/DishIngredientsModel.js');

//const DishStatusModel = require('../models/DishStatusModel');

//const Ingredients = require('../models/IngredientsModel.js');

//const SalesModel  = require('../models/SalesModel');

//const SalesDishesModel = require('../model/SalesDishesModel');

const newOrderController = {

    //Render Template
    getNewOrder: function(req, res)
    { 
            
        //DISHES
        var projection = '_id dishName dishPrice dishStatus';
        var dishes = [];

        db.findMany(Dishes, {}, projection, function(result)
        {
            for(var i=0; i<result.length; i++)
            {
                var dish = 
                {
                    systemID: result[i]._id,
					dishName: result[i].dishName,
                    dishPrice: result[i].dishPrice,
                    dishStatus: result[i].dishClassification
                };

                dishes.push(dish);
            }

        });
        
        //STATUS
        var projection2 = '_id status';
        var currentStatus = [];

        db.findMany(DishStatus, {}, projection2, function (result2) {
            //console.log(result2);
            for (var j = 0; j < result2.length; j++)
            {
                var status = 
                {
                    _id: result2[j]._id,
                    status: result2[j].status,
                };
                currentStatus.push(status);
            }         
                
        });   

        res.render('newOrder', {dishes, currentStatus});

    },
    /*
    getDishID: function(req, res) {
        
        var dishName = req.query.ingredientName;
        db.findOne(Dishes, {dishName: dishName}, '_id', function (result) {
            console.log(result);
            res.send(result);
        });
    },

    getDishName: function(req, res) { 
        var dishID = req.query.dishID;

        var projection = 'dishID dishName';

        db.findOne(Dishes, {dishID: dishID}, projection, function(result) {
            res.send(result);
        });
    },

    */

    getAutoDishName: function (req, res) {
		console.log(req.query.query);
		//$options:i denotes case insensitive searching
		db.findMany (Dishes, /*{$and: [ {dishStatus: "611369ebaf90cc0e419b25e0"},*/ {dishName:{$regex:req.query.query, $options:'i'}}, 'dishName', function (result) {
			console.log(result);
            var formattedResults = [];
			//reason for the for loop: https://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
			for (var i=0; i<result.length; i++) {
				var formattedResult = {
					label: result[i].dishName,
					value: result[i].dishName
				};
				formattedResults.push(formattedResult);
			}
			res.send(formattedResults);
		});


	},

    
////////////////////////////////////////////////////////  
/** 
    postAddOrder: function(req, res) {
		var dish = {
			dishName: req.query.dishName,
			dishPrice: parseFloat(req.query.dishPrice),
			dishStatus: req.query.dishStatus,
			dishClassification: req.query.dishClassification
        };


        db.findOne(DishStatus, {status: "Deleted"}, '_id', function(result) {
            var deleteStatusID = result._id;

            db.insertOne (Dishes, dish, function (flag) {
                var dishInfo = [];

                if (flag) {
                    db.findMany(Dishes, {dishName: dish.dishName}, '_id dishStatus', function(result2) {
                        for (var i = 0; i < result2.length; i++) {
                            if (deleteStatusID != result2[i].dishStatus) {
                                dishInfo = {
                                    _id : result2[i]._id
                                };
                            }
                        }
                        
                        res.send(dishInfo);
                    });
                } 
            });
        });
    },


    postAddSpecificDish: function(req, res) {
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

    };

    */
    

};
    
module.exports = newOrderController;


/*
Tasks: 

-Search Auto-Complete available dishes only

-Add Dishes and Quantity

-Show Dishes and Quantity in Table

-Validate Quantity of Order

-Calculate Quantity and Amount based on Dish Input

-Discount User Input as Percentage

-Auto Calculate fees

-Save Button 
    -saves sales and sales dishes data to table 
    -subtract from dish ingredients

-Show System Date on New Order screen

*/