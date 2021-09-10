const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishClassification = require('../models/DishClassificationModel.js');

const DishStatus = require('../models/DishStatusModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js');

const Conversion = require('../models/ConversionModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const Sales  = require('../models/SalesModel.js');

const SalesDishes = require('../models/SalesDishesModel.js');

const newOrderController = {

    //Render Template
    getNewOrder: function(req, res) { 

        if( req.session.position != 'Cashier'){
            res.redirect('/dashboard');
        }
        else{   

        function getDishes () {
            return new Promise ((resolve, reject) => {
                db.findMany (Dishes, {$or: [{dishStatus:"611369ebaf90cc0e419b25e0"}, {dishStatus:"6119fac6f933ea6c2f6d014f"}]}, '_id dishStatus', function (result) {
                    if (result!="")
                        resolve (result)
                })
            })
        }

        // get dish ingredients
        function getDishIngredients(dishID) {
            return new Promise ((resolve, reject) => {
                var projection = 'ingredientID quantity unitMeasurement';
                db.findMany (DishIngredients, {dishID: dishID}, projection, function(result) {
                    if (result!="")
                        resolve(result);
                });
            });
        }

        // get ingredient
        function getIngredient(ingredientID) {
            return new Promise ((resolve, reject) => {
                var projection = '_id ingredientName unitMeasurement quantityAvailable';
                db.findOne (Ingredients, {_id: ingredientID}, projection, function(result) {
                    if (result!="")
                        resolve(result);
                });
            });
        }

        //unitA will be ingredient unit, unitB will be dishUnit
        function getConversion (ingredientUnit, dishUnit){
            return new Promise((resolve, reject) => {
                var conversion = []
                db.findOne (Conversion, {$and:[ {unitA:ingredientUnit}, {unitB:dishUnit} ]}, 'ratio operator', function(result){
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
                //get all conversions with ingredientUnit
                db.findMany (Conversion, {unitA:unitA}, 'unitB ratio operator', function (result) { 
                    //get all conversions with dishUnit as unit to be converted to
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

        //converting from ingredientUnit to dishUnit
        function computeQuantityAvailable(quantityAvailable, conversion) {
            return new Promise((resolve, reject) => {
                var computedQuantity = quantityAvailable;

                //console.log("compute quantity " + conversion);
                for (var i=0; i<conversion.length; i++) {
                    var ratio = conversion[i].ratio
                    var operator = conversion[i].operator

                    if (operator == "*")
                        computedQuantity = computedQuantity * ratio
                    else 
                        computedQuantity = computedQuantity / ratio
                }
                //console.log(computedQuantity);
                resolve (computedQuantity);
            });
        }

        async function checkAvailability() {

            var dishes = await getDishes();

            for (var i=0; i<dishes.length; i++) {
                // get ingredients used per dish
                var dishIngredients = await getDishIngredients(dishes[i]._id);
                var outOfStock = false;
                //console.log(dishIngredients[k]);

                // for each dishIngredient, look for corresponding ingredient info
                for (var t = 0; t < dishIngredients.length && !outOfStock; t++) {

                    var ingredient = await getIngredient(dishIngredients[t].ingredientID);

                    var availableIngredient = ingredient.quantityAvailable;

                    //console.log("ingredient " + ingredient.unitMeasurement + "       dish unit " + dishIngredients[t].unitMeasurement + "\n")
                    //needs conversion, convert from ingredientUnit to dishUnit
                    if (ingredient.unitMeasurement != dishIngredients[t].unitMeasurement) {
                        var conversion;


                        //checks if there is direct converion
                        conversion = await getConversion (ingredient.unitMeasurement, dishIngredients[t].unitMeasurement);
                        
                        //no direct conversion, check for indirect conversions
                        if (conversion == null || conversion == "") 
                            conversion = await getIndirectConversion(ingredient.unitMeasurement, dishIngredients[t].unitMeasurement);

                        //console.log("IN IF " + conversion);


                        //console.log("DISH NAME " + dish.dishName + "     INGREDIENT " + ingredient.ingredientName);
                        availableIngredient = await computeQuantityAvailable(ingredient.quantityAvailable, conversion);
                    }

                    //console.log("DISH NAME " + dish.dishName + "     INGREDIENT " + ingredient.ingredientName);
                    //console.log("AVAILABLE: " + availableIngredient + " DISH NEED: " + dishIngredients[t].quantity);
                    
                    //not enough to make the dish, set status to out of stock
                    if (availableIngredient < dishIngredients[t].quantity) {
                        if (dishes[i].status!="6119fac6f933ea6c2f6d014f") {
                            db.updateOne(Dishes, {_id:dishes[i]._id}, {dishStatus:"6119fac6f933ea6c2f6d014f"}, function(flag) {
                                if (flag) { }
                            })
                        }
                        outOfStock = true;
                        //console.log("out of stock");
                    }
                    else {
                        if (dishes[i].dishStatus!="611369ebaf90cc0e419b25e0") {
                            db.updateOne(Dishes, {_id:dishes[i]._id}, {dishStatus:"611369ebaf90cc0e419b25e0"}, function(flag) {
                                if (flag) { }
                            })
                        }
                        //console.log("in stock");
                    }
                }
            }
            res.render('newOrder');
        }

        checkAvailability();
        }

    },

    checkIngredientQuantity: function (req, res) {

        function getDishID (dishName) {
            return new Promise ((resolve, reject) => {
                //dish is not unavailable
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

        var dishName = req.query.dishName;
        var dishOrderQuantity = req.query.quantity;

        async function checkQuantity() {
            var dishID = await getDishID (dishName);
            var dishIngredients = await getDishIngredients(dishID);
            var canBeMade = true;

            for (var i=0; i<dishIngredients.length && canBeMade; i++) {
                var quantityUsed = parseFloat(dishIngredients[i].quantity * dishOrderQuantity);
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

                    quantityUsed = await computeUsedQuantity (quantityUsed, conversion);
                    //console.log("QUANTITY USED WITH CONVERSION: " + quantityUsed);
                }
                var deductedQuantity = parseFloat(ingredient.quantityAvailable) - parseFloat(quantityUsed);

                //will cause negative ingredients
                console.log("i " + canBeMade )

                if (deductedQuantity < 0)
                    canBeMade = false
            }
            console.log(canBeMade)

            if (!canBeMade)
                res.send(false)
            else if (canBeMade)
                res.send(true)
        }

        checkQuantity()
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

                for (var i=0; i<dishesSave.length; i++) {
                    var dishIngredients = await getDishIngredients (dishesSave[i].dishID);

                    for (var j=0; j<dishIngredients.length; j++) {

                        var quantityUsed = parseFloat(dishIngredients[j].quantity * dishesSave[i].quantity);
                        //console.log("QUANTITY USED: " + quantityUsed);

                        var ingredient = await getIngredientInfo (dishIngredients[j].ingredientID);

                        //need conversion
                        if (dishIngredients[j].unitMeasurement != ingredient.unitMeasurement) {
                            var conversion;

                            //checks if there is direct converion from dishUnit to ingredientUnit
                            conversion = await getConversion (dishIngredients[j].unitMeasurement, ingredient.unitMeasurement);
                            
                            //no direct conversion, check for indirect conversions
                            if (conversion == null || conversion == "") 
                                conversion = await getIndirectConversion(dishIngredients[j].unitMeasurement, ingredient.unitMeasurement);

                            quantityUsed = await computeUsedQuantity (quantityUsed, conversion, );
                            //console.log("QUANTITY USED WITH CONVERSION: " + quantityUsed);
                        }

                        var deductedQuantity = parseFloat(ingredient.quantityAvailable) - parseFloat(quantityUsed);
                        //console.log ("DEDUCTED QUANTITY " + deductedQuantity);
                        db.updateOne (Ingredients, {_id:dishIngredients[j].ingredientID}, {quantityAvailable:deductedQuantity}, function (flag) {
                            if (flag) { }
                        })
                    }
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
            employeeID: req.session._id,
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