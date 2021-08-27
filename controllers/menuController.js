// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishClassification = require('../models/DishClassificationModel.js');

const DishStatus = require('../models/DishStatusModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const Units = require('../models/UnitsModel.js');

const Conversion = require('../models/ConversionModel.js');

const MenuController = {

	getMenu: function (req, res) {
		var checkedStatuses = [];
		var k;

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
			}) 
		}

		async function checkAvailability(dish) {
			// get ingredients used per dish

			var dishIngredients = await getDishIngredients(dish._id);
			var checkedDishes = [];
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
					if (dish.status!="6119fac6f933ea6c2f6d014f") {
						db.updateOne(Dishes, {_id:dish._id}, {dishStatus:"6119fac6f933ea6c2f6d014f"}, function(flag) {
							if (flag) { }
						})
					}
					outOfStock = true;
					//console.log("out of stock");
				}
				else {
					if (dish.dishStatus!="611369ebaf90cc0e419b25e0") {
						db.updateOne(Dishes, {_id:dish._id}, {dishStatus:"611369ebaf90cc0e419b25e0"}, function(flag) {
							if (flag) { }
						})
					}
					//console.log("in stock");
				}


				
			}
		}
		
		db.findMany(DishStatus, {}, '_id status', function(r) {
			for (k = 0; k < r.length; k++) {
				if (r[k].status == "Available" || r[k].status == "Out of Stock") {
					var checkStatus = {
						statusID: r[k]._id,
						statusName: r[k].status,
					};
					checkedStatuses.push(checkStatus);
				}
			}
			
			var dishProj = '_id dishName dishStatus';
			var checkedDishes = [];

			// get all dishes that are available
			db.findMany (Dishes, {dishStatus: checkedStatuses[0].statusID}, dishProj, function(r2) {
				for (k = 0; k < r2.length; k++) 
					checkedDishes.push(r2[k]);
				
				//get all dishes that are out of stock
				db.findMany (Dishes, {dishStatus: checkedStatuses[1].statusID}, dishProj, function(r3) {
					for (k = 0; k < r3.length; k++) 
						checkedDishes.push(r3[k]);

					// iterate through all dishes to get their ingredients
					for (k = 0; k < checkedDishes.length; k++) {
						//var dishID = checkedDishes[k]._id;

						// call async function
						checkAvailability(checkedDishes[k]);
					}
				});
			});
		});
		



		var menu = [];
		var statuses = [];
		var classifications = [];
		var dishes = [];

		var availableStatus = [];
		var unavailableStatus = [];
		var outOfStockStatus = [];

		var statusProjection = '_id status'; 	
		db.findMany (DishStatus, {}, statusProjection, function(result3) {

			for (var i=0; i<result3.length; i++) {

				if( result3[i].status == "Available"){
					availableStatus = {
						_id: result3[i]._id,
						classification: result3[i].status
					};
				}

				if( result3[i].status == "Unavailable"){

					unavailableStatus = {
						_id: result3[i]._id,
						classification: result3[i].status
					};
				}

				if( result3[i].status == "Out of Stock"){
					outOfStockStatus = {
						_id: result3[i]._id,
						classification: result3[i].status
					};
				}

				var status = {
					_id: result3[i]._id,
					status: result3[i].status
				};
				statuses.push( status );
			}

			var classProjection = '_id classification'; 	
			db.findMany (DishClassification, {}, classProjection, function(result) {
				
				for (var i=0; i<result.length; i++) {

					var classification = {
						_id: result[i]._id,
						classification: result[i].classification
					};
					classifications.push( classification );
				}

				classifications.push( unavailableStatus );
				classifications.push( outOfStockStatus );

				var dishProjection = '_id dishName dishPrice dishStatus dishClassification';
				db.findMany (Dishes, {}, dishProjection, function(result2) {

					for (var j =0; j<result2.length; j++) {

						var status = "Out of Stock";
						for(var i=0; i<statuses.length; i++){
							if(result2[j].dishStatus == statuses[i]._id )
								status = statuses[i].status;
						}

						var dish = {
							_id: result2[j]._id,
							dishName: result2[j].dishName,
							dishPrice: result2[j].dishPrice,
							dishStatus: status,
							dishClassification: result2[j].dishClassification
						};

						dishes.push( dish );
					}

					for (var i =0; i < classifications.length; i++){

						var temp = {
							classification: classifications[i].classification
						};

						menu.push ( temp );

						for (var j =0; j < dishes.length; j++){

							if( classifications[i]._id == dishes[j].dishClassification){
								if( dishes[j].dishStatus ==  availableStatus.classification ){
									dishes[j].dishClassification =  classifications[i].classification;
									menu.push( dishes[j] );
								}
							}

							if( classifications[i].classification == dishes[j].dishStatus){
								dishes[j].dishClassification =  classifications[i].classification;
								menu.push( dishes[j] );
							}
						}
					}

					res.render('menu', {menu});		
				});
			});
		});
	},

	getViewDish: function (req, res) {
		var systemID = req.params.systemID;
		var statuses = [];

		// Get "Available" and "Unavailable" status options to populate dropdown
		db.findMany(DishStatus, {}, '_id status', function(result) {

			for (var i = 0; i < result.length; i++) {
				var status = {
					_id: result[i]._id,
					status: result[i].status
				};

				if (status.status == "Available" || status.status == "Unavailable")
					statuses.push(status);
			}

			var projection = 'dishName dishPrice dishStatus dishClassification';

			// Get dish information based on the _id/systemID
			db.findOne (Dishes, {_id: systemID}, projection, function(result2) {
				var dish = {
					systemID: result2._id,
					dishName: result2.dishName,
					dishPrice: parseFloat(result2.dishPrice).toFixed(2),
					dishStatusID: result2.dishStatus,
					dishStatus: "Status",
					dishClassificationID: result2.dishClassification,
					dishClassification : "Classification"
				};

				// Get status of dish based on its _id
				db.findOne(DishStatus, {_id: dish.dishStatusID}, 'status', function(result3) {

					dish.dishStatus = result3.status;

					// Get classification of dish based on its _id
					db.findOne(DishClassification, {_id: dish.dishClassificationID}, 'classification', function(result4) {

						dish.dishClassification = result4.classification;

						var projection2 = 'dishID ingredientID quantity unitMeasurement';
						var dishIngredients = [];

						db.findMany(DishIngredients, {dishID: systemID}, projection2, function(result5) {

							for (var j = 0; j < result5.length; j++) {
								var dishIngredient = {
									dishID: result5[j].dishID,
									ingredientID: result5[j].ingredientID,
									ingredientName: "ingredient",
									quantity: result5[j].quantity,
									measurementID: result5[j].unitMeasurement,
									measurementName: "measurement"
								};

								dishIngredients.push(dishIngredient);
							}
							
							function getIngredientName (ingredientID) {
								return new Promise ((resolve, reject) => {
									db.findOne (Ingredients, {_id:ingredientID}, 'ingredientName', function(result) {
										if (result!="")
											resolve(result.ingredientName);
									});
								});
							}
					
							function getUnitName (unitID) {
								return new Promise ((resolve, reject) => {
									db.findOne (Units, {_id: unitID}, 'unit', function(result) {
										if (result!="")
											resolve(result.unit);
									});
								});
							}

							async function getNames(dishIngredients) {
								for (var i = 0; i < dishIngredients.length; i++) {
									dishIngredients[i].ingredientName = await getIngredientName(dishIngredients[i].ingredientID);
									dishIngredients[i].measurementName = await getUnitName(dishIngredients[i].measurementID);
								}
							
								//console.log(dish);
								//console.log(statuses);
								res.render('viewDish', {dish, statuses, dishIngredients});
							}

							getNames(dishIngredients);
						});
					});
				});
			});
		});
	},

	updateDishStatus: function (req, res) {
		db.updateOne(Dishes, {_id: req.body.dishID}, {dishStatus: req.body.dropdownValID}, function(flag) {
			if (flag) {

			}
		});
	},

	editDish: function (req, res) {
		var dishID = req.params.dishID;
		var projection = '_id dishName dishPrice dishStatus dishClassification';
	
		// search for dish in Dish
		db.findOne (Dishes, {_id: dishID}, projection, function(result) {
			var dish = {
				dishID: result._id,
				dishName: result.dishName,
				dishPrice: parseFloat(result.dishPrice),
				dishStatusID: result.dishStatus,
				dishStatus: "status",
				dishClassificationID: result.dishClassification,
				dishClassification: "classification"
			};

			// Get status of dish based on its _id
			db.findOne(DishStatus, {_id: dish.dishStatusID}, 'status', function(result2) {

				dish.dishStatus = result2.status;

				// Get classification of dish based on its _id
				db.findOne(DishClassification, {_id: dish.dishClassificationID}, 'classification', function(result3) {

					dish.dishClassification = result3.classification;

					var projection2 = '_id classification';
					var classifications = [];
					// Get all classifications for the dropdown
					db.findMany(DishClassification, {}, projection2, function (result4) {
						//console.log(result);
						for (var i = 0; i < result4.length; i++) {
							var classification = {
								_id: result4[i]._id,
								name: result4[i].classification,
							};

							if(dish.dishClassificationID != classification._id)
								classifications.push(classification);
						}

						//console.log(dish);
						//console.log(statuses);

						var projection3 = 'dishID ingredientID quantity unitMeasurement';
						var dishIngredients = [];

						db.findMany(DishIngredients, {dishID: dish.dishID}, projection3, function (result4) {
							for (var j = 0; j < result4.length; j++) {
								var dishIngredient = {
									dishID: result4[j].dishID,
									ingredientID: result4[j].ingredientID,
									ingredientName: "ingredient",
									quantity: result4[j].quantity,
									measurementID: result4[j].unitMeasurement,
									measurementName: "measurement"
								};

								dishIngredients.push(dishIngredient);
							}

							function getIngredientName (ingredientID) {
								return new Promise ((resolve, reject) => {
									db.findOne (Ingredients, {_id:ingredientID}, 'ingredientName', function(result) {
										if (result!="")
											resolve(result.ingredientName);
									});
								});
							}
					
							function getUnitName (unitID) {
								return new Promise ((resolve, reject) => {
									db.findOne (Units, {_id: unitID}, 'unit', function(result) {
										if (result!="")
											resolve(result.unit);
									});
								});
							}

							async function getNames(dishIngredients) {
								for (var i = 0; i < dishIngredients.length; i++) {
									dishIngredients[i].ingredientName = await getIngredientName(dishIngredients[i].ingredientID);
									dishIngredients[i].measurementName = await getUnitName(dishIngredients[i].measurementID);
								}
					
								//console.log(dishIngredients);

								db.findMany(Units, {}, '_id unit', function (result3) {
									var units = [];
				
									for (var k = 0; k < result3.length; k++) {
										var unit = {
											_id: result3[k]._id,
											unitName:result3[k].unit
										};
										units.push (unit);
									}
				
									//console.log(dishIngredients);
									res.render('editDish', {dish, classifications, dishIngredients, units});
								});
							}

							getNames(dishIngredients);
						});
					});
				});
			});
		});
	},

	getAutoIngredientNameEdit: function (req, res) {
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

	postEditDish: function(req, res) {
		var oldDishID = req.query.oldDishID;

		db.findOne(DishStatus, {status: "Deleted"}, '_id', function(result) {
			var deleteStatusID = result._id;
			
			// change status to deleted
			db.updateOne(Dishes, {_id: oldDishID}, {dishStatus: result._id}, function(result2) {
			//res.send(result);

				var dish = {
					dishName: req.query.dishName,
					dishPrice: parseFloat(req.query.dishPrice),
					dishStatus: req.query.dishStatus,
					dishClassification: req.query.dishClassification
				};

				//console.log(dish);
		
				db.insertOne (Dishes, dish, function (flag) {
					if (flag) {
						db.findMany(Dishes, {dishName: dish.dishName}, '_id dishStatus', function(result3) {
							//console.log("LENGTH: " + result3.length);
							//console.log(result3);
							var dishInfo = [];

							for (var i = 0; i < result3.length; i++) {
								if (deleteStatusID != result3[i].dishStatus) {
									//console.log(result3[i]);

									dishInfo = {
										_id: result3[i]._id,
										dishStatus: result3[i].dishStatus
									};
								}
							}
							res.send(dishInfo);
						});
					} 
				});
			});
		});

	},
	
	getDishName: function(req, res) {
		var dishName = req.query.dishName;
		var origDishName = req.query.origDishName;

		db.findOne(DishStatus, {status: "Deleted"}, '_id', function(result) {
			var deleteStatusID = result._id;
		
			// Look for Dish Name
			db.findMany(Dishes, {dishName: dishName}, 'dishName dishStatus', function (result2) {
				//console.log(result2);
				var resultDishName;
				for (var i = 0; i < result2.length; i++) {
					if (deleteStatusID != result2[i].dishStatus && origDishName != result2[i].dishName) {
						//console.log("dish name: " + dishName + " result name: " + result2[i].dishName);
						resultDishName = result2[i].dishName;

						console.log("Delete status ID: " + deleteStatusID, " Status: " + result2[i].dishStatus);

						//console.log(result2[i]);

						//console.log("ALL" + result2);
						//console.log(dishName);
						console.log(resultDishName);
					}
				}
				res.send(resultDishName);
			});
		});
	}
};


module.exports = MenuController;