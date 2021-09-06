const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishClassification = require('../models/DishClassificationModel.js');

const DishStatus = require('../models/DishStatusModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js');

const Conversion = require('../models/ConversionModel.js');

//const DishStatusModel = require('../models/DishStatusModel');

const Ingredients = require('../models/IngredientsModel.js');

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
                db.findOne (Dishes, {$and: [ {dishName:dishName}, {dishStatus: {$ne:"611b5e68f41bfa1c9b0b6cec"}}]}, '_id', function (result) {
                    if (result!="")
                        resolve(result._id);
                })
            })
        }

        function getDishIngredients (dishID) {
            return new Promise ((resolve, reject) => {
                db.findMany(DishIngredients, {dishID:dishID}, 'ingredientID quantity unitMeasurement', function(result) {
                    if (result!="")
                        resolve(result);
                })
            })
        }

        function getIngredientInfo (ingredientID) {
            return new Promise ((resolve, reject) => {
                db.findOne (Ingredients, {_id:ingredientID}, '_id quantityAvailable unitMeasurement', function (result) {
                    if (result!="")
                        resolve(result);
                })
            })
        }

        //unitA will be ingredient unit, unitB will be dishUnit
        function getConversion (dishUnit, ingredientUnit){
            return new Promise((resolve, reject) => {
                var conversion = []
                db.findOne (Conversion, {$and:[ {unitA:dishUnit}, {unitB:ingredientUnit} ]}, 'ratio operator', function(result){
                    //console.log("direct " + result);
                    if (result!="") {
                        conversion.push (result)
                        resolve(conversion);
                    }
                })
            })
        }

        function getIndirectConversion(unitA, unitB) {
            return new Promise ((resolve, reject) => {
                var conversions = [];
                //get all conversions with unitA
                db.findMany (Conversion, {unitA:unitA}, 'unitB ratio operator', function (result) { 
                    //get all conversions with unitB as unit to be converted to
                    db.findMany (Conversion, {unitB:unitB}, 'unitA ratio operator', function (result1) {
                        var found = false;
                        for (var i=0; i<result.length && !found; i++) {
                            for (var j=0; j<result1.length && !found; j++) {
                                if (result[i].unitB == result1[j].unitA) {
                                    conversions.push (result[i]);
                                    conversions.push (result1[j]);
                                    found = true;
                                }
                            }
                        }
                        //console.log("indirect " + conversions);
                        resolve(conversions);
                    })
                }) 
            })
        }

        //converting from dishUnit to ingredientUnit
        function computeUsedQuantity(quantityUsed, conversion) {
            return new Promise((resolve, reject) => {
                var computedQuantity = quantityUsed;

                //console.log("compute quantity " + conversion);
                for (var i=0; i<conversion.length; i++) {
                    var ratio = conversion[i].ratio
                    var operator = conversion[i].operator

                    if (operator == "*")
                        computedQuantity = computedQuantity * ratio
                    else 
                        computedQuantity = computedQuantity / ratio
                }
                //console.log("COMPUTED QUANTITY: " + computedQuantity);
                resolve (computedQuantity);
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

                var dishIngredients = await getDishIngredients (dishID);

                for (var i=0; i<dishIngredients.length; i++) {

                    var quantityUsed = dishIngredients[i].quantity;
                    //console.log("QUANTITY USED: " + quantityUsed);

                    var ingredient = await getIngredientInfo (dishIngredients[i].ingredientID);

                    //need conversion
                    if (dishIngredients[i].unitMeasurement != ingredient.unitMeasurement) {
                        var conversion;

                        //checks if there is direct converion from dishUnit to ingredientUnit
                        conversion = await getConversion (dishIngredients[i].unitMeasurement, ingredient.unitMeasurement);
                        
                        //no direct conversion, check for indirect conversions
                        if (conversion == null || conversion == "") 
                            conversion = await getIndirectConversion(dishIngredients[i].unitMeasurement, ingredient.unitMeasurement);

                        quantityUsed = await computeUsedQuantity (dishIngredients[i].quantity, conversion);
                        //console.log("QUANTITY USED WITH CONVERSION: " + quantityUsed);
                    }

                    var deductedQuantity = ingredient.quantityAvailable - quantityUsed;
                    //console.log ("DEDUCTED QUANTITY " + deductedQuantity);
                    db.updateOne (Ingredients, {_id:dishIngredients[i].ingredientID}, {quantityAvailable:deductedQuantity}, function (flag) {
                        if (flag) { }
                    })
                }
            }
            db.insertMany (SalesDishes, dishesSave, function (flag) {
                if (flag) {}
            })
            res.redirect('/order/' + salesID);
        }




        var dishes = JSON.parse(req.body.dishString);
        var orderTotal = req.body.total;
        var vat= req.body.vat;
        var discount = req.body.discount;

        var dateOrdered = new Date();

        var sale = {
            employeeID: "610c0a7076be1fa0308b0ef8",
            date: dateOrdered, 
            total: orderTotal,
            VAT: vat,
            discount: discount
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

-Show System Date on New Order screen

*/