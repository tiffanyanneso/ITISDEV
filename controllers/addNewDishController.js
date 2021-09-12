
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const IngredientTypes = require('../models/IngredientTypesModel.js');

const DishClassification = require('../models/DishClassificationModel.js');

const DishStatus = require('../models/DishStatusModel.js');

const Units = require('../models/UnitsModel.js');

const Conversion = require('../models/ConversionModel.js');

const addNewDishController = {

    getAddNewDish: function (req, res) {

        if( req.session.position != 'Admin' ){
            res.redirect('/dashboard');
        }
        else{

        function getDishClassification() {
            return new Promise ((resolve, reject) => {
                var classifications = []
                 db.findMany(DishClassification, {}, '_id classification', function (result) {
                    for (var i = 0; i < result.length; i++) {
                        var classification = {
                            _id: result[i]._id,
                            name: result[i].classification,
                        };
                        classifications.push(classification);
                    }
                    resolve (classifications)
                 })
            })
        }

        function getDishStatuses() {
            return new Promise ((resolve, reject) => {
                var statuses = []
                db.findMany(DishStatus, {}, '_id status', function (result2) {
                    //console.log(result2);
                    for (var j = 0; j < result2.length; j++) {
                        var status = {
                            _id: result2[j]._id,
                            status: result2[j].status,
                        };

                        if (status.status == "Available" || status.status == "Unavailable")
                            statuses.push(status);
                    }
                    resolve(statuses)
                })
            })
        }

        function getUnits() {
            return new Promise((resolve, reject) => {
                var units = []
                db.findMany(Units, {}, '_id unit', function (result3) {
                    var units = [];

                    for (var k = 0; k < result3.length; k++) {
                        var unit = {
                            _id: result3[k]._id,
                            unitName:result3[k].unit
                        };
                        units.push (unit);
                    }
                    resolve(units)
                })
            })
        }

        function getIngredientTypes() {
            return new Promise((resolve, reject) => {
                db.findMany (IngredientTypes, {}, '_id ingredientType', function (result) {
                    if (result!="")
                        resolve (result)
                })
            })
        }

        var projection1 = '_id classification';
        var classifications = [];


                
        async function getInfo() {
            var classifications = await getDishClassification();
            var statuses = await getDishStatuses();
            var units = await getUnits();
            var ingredientTypes = await getIngredientTypes();
        
            res.render('addNewDish', {classifications, statuses, units, ingredientTypes});
        }

        getInfo();
        
        }
    },

    getCheckDishName: function(req, res) {
        var dishName = req.query.dishName;

        db.findOne(DishStatus, {status: "Deleted"}, '_id', function(result) {
            var deleteStatusID = result._id;
            
            // Look for Dish Name
            db.findMany(Dishes, {dishName: dishName}, 'dishName dishStatus', function (result2) {
                //console.log(result2);
                var dishDetails = [];

                for (var i = 0; i < result2.length; i++) 
                    if (result2[i].dishStatus != deleteStatusID)  {
                        dishDetails = {
                            dishName: result2[i].dishName,
                        };
                    }

                //console.log("dishName " + dishDetails);
                
                res.send(dishDetails);
            });
		
		});
    },

    getIngredientID: function(req, res) {
        var ingredientName = req.query.ingredientName;

        // Look for Ingredient ID
        db.findOne(Ingredients, {ingredientName: ingredientName}, '_id', function (result) {
            //console.log(result);
            res.send(result);
        });
    },

    getUnitID: function(req, res) {
        var unitName = req.query.unit;

        // Look for Ingredient ID
        db.findOne(Units, {unit: unitName}, '_id', function (result) {
            console.log(result);
            res.send(result);
        });
    },

    getIngredientData: function(req, res) {
        var ingredientName = req.query.ingredientName;

        // Look for Ingredient ID
        db.findOne(Ingredients, {ingredientName: ingredientName}, '_id', function (result) {
            //console.log(result);

            var unitName = req.query.unit;

            // Look for Ingredient ID
            db.findOne(Units, {unit: unitName}, '_id', function (result) {
                console.log(result);
                res.send(result);
            });
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
        var parsedIngredients = JSON.parse(req.body.JSONIngredients);
        var location = req.body.location;
        var dishID = req.body.dishID;

        function getIngredientID (ingredientName) {
            return new Promise ((resolve, reject) => {
                db.findOne (Ingredients, {ingredientName:ingredientName}, '_id', function(result) {
                    if (result!="")
                        resolve(result._id);
                });
            });
        }

        function getUnitID (unitName) {
            return new Promise ((resolve, reject) => {
                db.findOne (Units, {unit: unitName}, '_id', function(result) {
                    if (result!="")
                        resolve(result._id);
                });
            });
        }

        function getIngredientInfo (ingredientID) {
            return new Promise ((resolve, reject)=> {
                db.findOne (Ingredients, {_id:ingredientID}, 'quantityAvailable unitMeasurement', function (result) {
                    if (result!="")
                        resolve (result)
                })
            })
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

       async function checkAvailability(ingredientID, quantityUsed, unitMeasurementUsed) {
            var ingredientInfo = await getIngredientInfo (ingredientID)

            var availableIngredient = ingredientInfo.quantityAvailable

            if (ingredientInfo.unitMeasurement != unitMeasurementUsed) {
                    //checks if there is direct converion
                conversion = await getConversion (ingredientInfo.unitMeasurement, unitMeasurementUsed);
                
                //no direct conversion, check for indirect conversions
                if (conversion == null || conversion == "") 
                    conversion = await getIndirectConversion(ingredientInfo.unitMeasurement, unitMeasurementUsed);

                availableIngredient = await computeQuantityAvailable(ingredientInfo.quantityAvailable, conversion);
            }

            //quantity used is more than available, should not be available
            if (quantityUsed > availableIngredient)
                return false
            else
                return true
        }


        function updateDishStatus(dishID) {
            db.updateOne(Dishes, {_id:dishID}, {dishStatus:"6119fac6f933ea6c2f6d014f"}, function (result) {

            })
        }

        async function saveIngredients(ingredients) {
            for (var i = 0; i < ingredients.length; i++) {
                ingredients[i].ingredientID = await getIngredientID(ingredients[i].ingredientID);
                ingredients[i].unitMeasurement = await getUnitID(ingredients[i].unitMeasurement);

                var available = await checkAvailability(ingredients[i].ingredientID, ingredients[i].quantity, ingredients[i].unitMeasurement)
                if (!available) 
                    updateDishStatus(dishID)
            }


            //console.log(ingredients);
            // call unit and ingredient 
            db.insertMany (DishIngredients, ingredients, function(flag) {
                if (flag) {
                    if (location == "editDish") {
                        res.send({redirect: '/menu/' + dishID});
                    } else if (location == "addNewDish") {
                        res.send({redirect: '/menu/'});
                    }
                } 
            });

        }

        saveIngredients(parsedIngredients);

    },

    addDishUnit: function(req, res) {
        var unit = req.body.unit;
        db.insertOneResult (Units, {unit:unit}, function (result) {
            res.send(result);
        })
    }
	
};

module.exports = addNewDishController;