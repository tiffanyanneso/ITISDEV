
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Ingredients = require('../models/IngredientsModel.js');

const Stock = require('../models/StockModel.js');

const Units = require('../models/UnitsModel.js');

const InventoryStatus = require('../models/InventoryStatusModel.js');

const IngredientTypes = require('../models/IngredientTypesModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js')

//import models

const viewInventoryController = {

	//render existing inventory list
	getInventory: function (req, res) {

		function getUnitName(unitId) {
			return new Promise ((resolve, reject) => {
				db.findOne (Units, {_id:unitId}, 'unit', function(result){
					if (result!="")
						resolve(result.unit);
				});
			});
		}

		function getStatus (statusID) {
			return new Promise ((resolve, reject) => {
				db.findOne (InventoryStatus, {_id: statusID}, 'status', function (result) {
					if (result!="")
						resolve(result.status)
				})
			})
		}

		function getUnits() {
			return new Promise ((resolve, reject) => {
				db.findMany (Units, {}, ' _id unit', function(result){
					if (result!="")
						resolve(result);
				});
			});
		}

		function getStatuses() {
			return new Promise ((resolve, reject) => {
				db.findMany (InventoryStatus, {}, ' _id status', function(result){
					if (result!="")
						resolve(result);
				});
			});
		}

		function getIngredientTypes() {
			return new Promise ((resolve, reject) => {
				db.findMany (IngredientTypes, {}, '_id ingredientType', function(result) {
					if (result!="")
						resolve(result);
				})
			})
		}

		async function getUnit(ingredients) {
			for (var i=0; i<ingredients.length; i++) {
				ingredients[i].unitMeasurement = await getUnitName (ingredients[i].unitMeasurement);

				var statusID;
				if (ingredients[i].quantityAvailable > 0)
					statusID = "6135a6a4ed3ee2ca352c7b94";
				else
					statusID = "6135a6c1ed3ee2ca352c7b96";

				ingredients[i].statusID = statusID;
				ingredients[i].status = await getStatus (statusID)
			}

			var units = await getUnits();
			var statuses = await getStatuses();
			var ingredientTypes = await getIngredientTypes();
			
			res.render('viewInventory', {ingredients, units, statuses, ingredientTypes});
		}

		var projection = '_id ingredientName ingredientType quantityAvailable unitMeasurement'; 	
		var ingredients = [];
		db.findMany (Ingredients, {}, projection, function(result) {
			for (var i=0; i<result.length; i++) {
				

				var ingredient = {
					systemID: result[i]._id,
					ingredientName: result[i].ingredientName,
					ingredientType: result[i].ingredientType,
					quantityAvailable: result[i].quantityAvailable,
					unitMeasurement: result[i].unitMeasurement,
				};
				ingredients.push(ingredient);		
			}
			getUnit(ingredients);
			
		});
	},

	addIngredient: function(req, res) {
		var ingredient = {
			ingredientName: req.body.ingredientName,
			ingredientType: req.body.ingredientType,
			quantityAvailable: 0,
			unitMeasurement: req.body.ingredientUnitVal,
			reorderLevel: 0,
			ingredientID: req.body.systemID,
			//_id: req.params.systemID
		};
/*
		db.insertOne (Ingredients, ingredient, function (result) {
			res.send({redirect: '/ingredient/:id' + req.params.systemID});

		});

		insertOneResult: function(model, doc, callback) {
			model.create(doc, function(error, result) {
				if(error) return callback(false);
				console.log('Added ' + result);
				return callback(result);
			});
		},
*/
		db.insertOneResult(Ingredients, ingredient, function(result){
			var ingredientID = result._id;
			res.send(ingredientID);
		});
	},

	

	//view individual ingredients and their stock
	getIngredient: function(req, res) {

		function getUnitName(unitId) {
			return new Promise ((resolve, reject) => {
				db.findOne (Units, {_id:unitId}, 'unit', function(result){
					if (result!="")
						resolve(result.unit);
				});
			});
		}

		async function getUnit(ingredientDetails, stocks) {
			ingredientDetails.unitMeasurement = await getUnitName(ingredientDetails.unitMeasurement);
			for (var i=0; i<stocks.length; i++) {
				var unitName = await getUnitName (stocks[i].stockUnit);
				stocks[i].stockUnit = unitName;
			}

			db.findMany (Units, {}, '_id unit', function (result2) {
				var units = [];
				for (var i=0; i<result2.length; i++) {
					var unit = {
						id:result2[i]._id,
						unitName:result2[i].unit
					};
					units.push (unit);
				}
				res.render('viewIngredient', {ingredientDetails, stocks, units});
			});
		}

		var projection = '_id ingredientName ingredientType quantityAvailable unitMeasurement reorderLevel';

		//look for the ingredient
		db.findOne(Ingredients, {_id:req.params.systemID}, projection, function(result) {
			//look for stocks of the ingredient
			var ingredientDetails = result;
			var stockProjection = 'stockName quantity stockUnit';
			var stocks = [];

			db.findMany (Stock, {ingredientID:result._id}, stockProjection, function(result2) {
				for (var i=0; i<result2.length; i++) {
					var stock = {
						stockName: result2[i].stockName,
						quantity: result2[i].quantity,
						stockUnit: result2[i].stockUnit
					};
					stocks.push(stock);
				}

				getUnit(ingredientDetails, stocks);
			});
		});
		
	},

	getCheckStockName: function (req, res) {
        db.findOne(Stock, {stockName: req.query.stockName}, 'stockName', function (result) {
            res.send(result);
        });
	},

	addStock: function(req, res) {
		db.findOne(Ingredients, {ingredientName:req.body.ingredientName}, '_id', function(result) {
			var stock = {
				stockName: req.body.stockName,
				ingredientID: result._id,
				quantity: req.body.quantity,
				stockUnit: req.body.stockUnitVal
			};

			db.insertOne(Stock, stock, function(flag) {
				if (flag) { }
			});	
		});
	},

	reorderFormulaInput: function (req, res) {
		var reorderMultipliers = req.body.values;

		function getIngredients(ingredientType) {
			return new Promise ((resolve, reject) => {
				db.findMany (Ingredients, {ingredientType:ingredientType}, '_id reorderLevel unitMeasurement', function (result){
					if (result!="")
						resolve (result)
				})
			})
		}

		function getDishes(ingredientID) {
			return new Promise ((resolve, reject) => {
				//code to check dishstatus 
				db.findMany (DishIngredients, {ingredientID:ingredientID}, 'quantity unitMeasurement', function (result) {
					if (result!="")
						resolve (result)
				})
			})
		}


		async function setReorder() {
			for (var i=0; i<reorderMultipliers; i++) {
				//get all ingredients with specific ingredient type
				var ingredients = await getIngredients(reorderMultipliers[i].typeID)

				for (var j=0; j<ingredients; j++) {
					
					var totalQuantity = 0;			//total quantity of ingredients needed to make all dishes with that ingredient
					var dishes = await getDishes(ingredients[i].id);		//get all dishes that use the ingredient 

					for (var k=0; k<dishes.length; i++) {

						var neededQuantity = dishes[k].quantity;

						//needs conversion, convert from dish unit to ingredient unit
						if (dishes[k].unitMeasurement != ingredient[j].unitMeasurement) {
							var conversion;

							//checks if there is direct converion
							conversion = await getConversion (dishes[k].unitMeasurement, ingredient[j].unitMeasurement);
							
							//no direct conversion, check for indirect conversions
							if (conversion == null || conversion == "") 
								conversion = await getIndirectConversion(dishes[k].unitMeasurement != ingredient[j].unitMeasurement);
							
							neededQuantity = await computeQuantity(dishes[k].quantity, conversion)
						}

						totalQuantity += neededQuantity
					}

					ingredients[j].reorderLevel = totalQuantity * reorderMultipliers[i].multiplier
				}
			}
		}


		setReorder();
	},

	reorderFormulaSales: function (req, res) {
		function getIngredients() {
		    return new Promise ((resolve, reject) => {
		        var ingredients = []
		        var ingredientProjection = '_id unitMeasurement reorderLevel';
		        db.findMany (Ingredients, {}, ingredientProjection, function (result) {

		            for (var i = 0; i < result.length; i++) {
		                var ingredient = {
		                    _id: result[i]._id,
		                    used: 0,
		                    unit: result[i].unitMeasurement,
		                    reorderLevel: result[i].reorderLevel
		                };
		                ingredients.push(ingredient);
		            }
		            resolve (ingredients);
		        })   
		    })
		}					


		//get the dates where there were sales recorded
		function getSalesDays() {
			return new Promise (Sales, {}, 'date', function(result) {
				var uniqueDates = []
				for (var i=0; i<result.length; i++) {
					var date = new Date (result.date)
					//checks if the date is new/unique, -1 means that it's not in the array
					if (jquery.inArray(date, uniqueDates) == -1)
						uniqueDates.push (date)
				}
				resolve (uniqueDates)
			})
		}


		function getSalesToday(dateToday) {
			return new Promise ((resolve, reject) => {
				var dateToday = new Data (dateToday); 
				var sales = 0
				db.findMany (Sales, {}, '_id date', function(result) {
		            for (var i=0; i<result.length; i++) {
		                var date = new Date(result[i].date);
		                date.setHours(0,0,0,0);

		                if (!(startDate > date || date > endDate))
		                    sales.push(result[i]);
		            }
		            resolve (sales)
		        })
			})
		}

		function getDishSales (salesID) {
		    return new Promise((resolve, reject) => {
		        db.findMany (SalesDishes, {salesID:salesID}, 'dishID quantity', function (result) {
		            if (result!="")
		                resolve(result);
		        })
		    })
		}

		function getDishIngredients (dishID) {
		    return new Promise ((resolve, reject) => {
		        db.findMany (DishIngredients, {dishID:dishID}, 'ingredientID quantity unitMeasurement', function (result) {
		            if (result!="")
		                resolve(result);
		        })
		    })
		}

		function getIngredient (ingredientID) {
		    return new Promise ((resolve, reject) => {
		        db.findOne (Ingredients, {_id: ingredientID}, 'unitMeasurement', function(result) {
		            if (result!="")
		                resolve(result);
		        })
		    })
		}

		function getConversion (fromUnit, toUnit){
		    return new Promise((resolve, reject) => {
		        var conversion = [];
		        db.findOne (Conversion, {$and:[ {unitA:fromUnit}, {unitB:toUnit} ]}, 'ratio operator', function(result){
		            //console.log("direct " + result);
		            if (result!="") {
		                conversion.push (result);
		                resolve(conversion);
		            }
		        });
		    });
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
		            });
		        }); 
		    });
		}


		/*function computeAverageSales (totals) {
			return new Promise ((resolve, reject) => {
				var total = 0;
				var length = totals.length
				for (var i=0; i<totals.length; i++) 
					total += totals[i]
				
				return total/length;
			})
		}*/



		async function computeReorder() {
			var dailySales = [] 
			var totals = []

			var ingredients =await getIngredients();

			//get all days with sales in db
			var salesDay = await getSalesDays();

			for (var i=0; i<salesDay; i++) {
				//get sales id of sales made today
				var salesToday = await getSalesToday(salesDay[i]);

				for (var j=0; j<salesToday; j++) {
					var dishSales = await getDishSales(salesToday[i]._id)

					for (var k=0; k<dishSales.length; k++) {
						var dishIngredients = await getDishIngredients (dishSales[k])

						for (var l=0; l<dishIngredients; l++) {

							for (var m=0; m<ingredients.length; m++) {

								if (dishIngredients[l].ingredientID == ingredients[m]._id) {
									//need conversion
		                                if (dishIngredients[l].unitMeasurement != ingredients[m].unit) {
		                                    var conversion;

		                                    //checks if there is direct converion
		                                    conversion = await getConversion (dishIngredients[l].unitMeasurement, ingredients[m].unit);
		                                    
		                                    //no direct conversion, check for indirect conversions
		                                    if (conversion == null || conversion == "") {
		                                        conversion = await getIndirectConversion(dishIngredients[l].unitMeasurement, ingredients[m].unit);
		                                    }

		                                    ingredients[m].used += await computeQuantityUsed(dishIngredients[l].quantity, conversion, dishSales[k].quantity);
		                                }
		                               else {
		                                    //console.log(dishSales[j])
		                                    ingredients[m].used += (dishIngredients[l].quantity * dishSales[k].quantity)
		                                    //console.log(dishIngredients[k].quantity +" " + dishSales[j].quantity)
		                               }
								}
							}
						}
					}
				}
				for (var n=0; n<ingredients.length; n++) {
					if (ingredients[n].used > ingredients[n].reorderLevel)
						ingredients[n].reorderLevel = ingredients[n].used;

					//make used 0 again for the next day
					ingredients[n].used = 0
				}
			}

		}

		computeReorder();
	}
};

module.exports = viewInventoryController;