
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const DishClassification = require('../models/DishClassificationModel.js');

const DishStatus = require('../models/DishStatusModel.js');

const Units = require('../models/UnitsModel.js');

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

                    if (status.status == "Available" || status.status == "Unavailable")
                        statuses.push(status);
                }

                db.findMany(Units, {}, '_id unit', function (result3) {
                    var units = [];

				    for (var k = 0; k < result3.length; k++) {
                        var unit = {
                            _id: result3[k]._id,
                            unitName:result3[k].unit
                        };
					    units.push (unit);
				    }

                    res.render('addNewDish', {classifications, statuses, units});
                });
            });
		});
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

        async function saveIngredients(ingredients) {
            for (var i = 0; i < ingredients.length; i++) {
                ingredients[i].ingredientID = await getIngredientID(ingredients[i].ingredientID);
                ingredients[i].unitMeasurement = await getUnitID(ingredients[i].unitMeasurement);
            }

            console.log(ingredients);
            // call unit and ingredient 
            db.insertMany (DishIngredients, ingredients, function(flag) {
                if (flag) {
                } 
            });

        }

        saveIngredients(parsedIngredients);

    }
	
};

module.exports = addNewDishController;