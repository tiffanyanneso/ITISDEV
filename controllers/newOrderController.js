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


    getAutoDishName: function (req, res) {
		console.log(req.query.query);
		//$options:i denotes case insensitive searching
		db.findMany (Dishes, {dishName:{$regex:req.query.query, $options:'i'}}, 'dishName', function (result) {
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