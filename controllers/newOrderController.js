const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishClassification = require('../models/DishClassificationModel.js');

const DishStatus = require('../models/DishStatusModel.js');

//const DishIngredients = require('../models/DishIngredientsModel.js');

//const DishStatusModel = require('../models/DishStatusModel');

//const Ingredients = require('../models/IngredientsModel.js');

const Sales  = require('../models/SalesModel.js');

const SalesDishes = require('../models/SalesDishesModel.js');

const newOrderController = {

    //Render Template
    getNewOrder: function(req, res) { 
            
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

    getDishName: function (req, res) {
		//$options:i denotes case insensitive searching
        db.findMany (Dishes, {$and: [ {dishName:{$regex:req.query.query, $options:'i'}}, {dishStatus:"611369ebaf90cc0e419b25e0"} ]}, 'dishName', function (result) {
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

    getDishPrice: function (req, res) {
        db.findOne (Dishes, {dishName: req.query.dishName}, 'dishPrice',  function (result) {
            res.send(result);
        })
    },

    saveSale: function (req, res) {

        function getDishID (dishName) {
            return new Promise ((resolve, reject) => {
                db.findOne (Dishes, {dishName:dishName}, '_id', function (result) {
                    if (result!="")
                        resolve(result._id);
                })
            })
        }

        async function dishID (dishes, salesID) {
            var dishesSave = []
            for (var i=0; i<dishes.length; i++) {
                var dishID = await getDishID(dishes[i].dishName);
                var dishFormatted = {
                    salesID: salesID,
                    dishID: dishID,
                    quantity: dishes[i].quantity
                } 
                dishesSave.push(dishFormatted);
            }
            db.insertMany (SalesDishes, dishesSave, function (flag) {
                if (flag) {}
            })
        }

        var dishes = JSON.parse(req.body.dishString);
        var orderTotal = req.body.orderTotal;
        var dateOrdered = new Date();

        var sale = {
            employeeID: "610c0a7076be1fa0308b0ef8",
            date: dateOrdered, 
            total: orderTotal,
            VAT: 0,
            discount: 0
        };
        

        db.insertOneResult (Sales, sale, function (result) {
            salesID = result._id;
            dishID (dishes, salesID);
        })
    }

};

    
module.exports = newOrderController;


/*
Tasks: 

-Validate Quantity of Order

-Discount User Input as Percentage

-Save Button 
    -saves sales and sales dishes data to table 
    -subtract from dish ingredients

-Show System Date on New Order screen

*/