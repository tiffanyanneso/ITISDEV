
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Ingredients = require('../models/IngredientsModel.js');

const Stock = require('../models/StockModel.js');

const Units = require('../models/UnitsModel.js');

const InventoryStatus = require('../models/InventoryStatusModel.js');

const IngredientTypes = require('../models/IngredientTypesModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js')

const Conversion = require('../models/ConversionModel.js');

const Sales = require('../models/SalesModel.js');

const SalesDishes = require('../models/SalesDishesModel.js');

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

		function getIngredientType (typeID) {
			return new Promise ((resolve, reject) => {
				db.findOne (IngredientTypes, {_id: typeID}, 'ingredientType', function (result) {
					if (result!="")
						resolve (result.ingredientType)
				})
			})
		}


		async function getUnit(ingredients) {
			for (var i=0; i<ingredients.length; i++) {
				ingredients[i].unitMeasurement = await getUnitName (ingredients[i].unitMeasurement);
				ingredients[i].ingredientTypeName = await getIngredientType(ingredients[i].ingredientType);

				var statusID;
				//ingredient is available
				if (ingredients[i].quantityAvailable > 0 && ingredients[i].quantityAvailable > ingredients[i].reorderLevel)
					statusID = "6135a6a4ed3ee2ca352c7b94";
				//ingredient is low stock
				else if (ingredients[i].quantityAvailable > 0 && ingredients[i].quantityAvailable < ingredients[i].reorderLevel)
					statusID = "6135a6b3ed3ee2ca352c7b95";
				//ingredient is out of stock
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

		var projection = '_id ingredientName ingredientType quantityAvailable unitMeasurement reorderLevel'; 	
		var ingredients = [];
		db.findMany (Ingredients, {}, projection, function(result) {
			for (var i=0; i<result.length; i++) {
				

				var ingredient = {
					systemID: result[i]._id,
					ingredientName: result[i].ingredientName,
					ingredientType: result[i].ingredientType,
					quantityAvailable: parseFloat(result[i].quantityAvailable),
					unitMeasurement: result[i].unitMeasurement,
					reorderLevel: parseFloat(result[i].reorderLevel)
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

		function getIngredientType (typeID) {
			return new Promise ((resolve, reject) => {
				db.findOne (IngredientTypes, {_id: typeID}, 'ingredientType', function (result) {
					if (result!="")
						resolve (result.ingredientType)
				})
			})
		}

		function getStatusName (statusID) {
			return new Promise((resolve, reject) => {
				db.findOne (InventoryStatus, {_id:statusID}, 'status', function (result) {
					if(result!="")
						resolve(result.status);
				})
			})
		}

		async function getUnit(ingredientDetails, stocks) {
			ingredientDetails.unitName = await getUnitName(ingredientDetails.unitMeasurement);
			ingredientDetails.ingredientType = await getIngredientType(ingredientDetails.ingredientType)
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
			if (ingredientDetails.quantityAvailable > ingredientDetails.reorderLevel)
				ingredientDetails.status = "Available"
			else if (ingredientDetails.quantityAvailable < ingredientDetails.reorderLevel && ingredientDetails.quantityAvailable > 0 )
				ingredientDetails.status = "Low Stock"
			else
				ingredientDetails.status = "Out of Stock"

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

	checkConversion: function (req, res) { 
		var ingredientUnit = req.query.ingredientUnit;
		var stockUnit = req.query.stockUnit;

		db.findOne (Conversion, {$or:[{$and:[ {unitA:ingredientUnit}, {unitB:stockUnit} ]}, {$and:[ {unitA:stockUnit}, {unitB:ingredientUnit} ]}]}, '_id', function(result) {
			if (result!=null)
				res.send(true);
			else
				res.send(false)
		})
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
		var reorderMultipliers = JSON.parse(req.body.multipliers);

		function getIngredients(ingredientType) {
			return new Promise ((resolve, reject) => {
				db.findMany (Ingredients, {ingredientType:ingredientType}, '_id reorderLevel unitMeasurement', function (result){
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

		function updateMultiplier(reorderMultipliers) {
			db.updateOne (IngredientTypes, {_id: reorderMultipliers.typeID}, {multiplier: reorderMultipliers.multiplier}, function (result) {

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

		function computeQuantity (quantity, conversion) {
			return new Promise((resolve, reject) => {
				//console.log(conversion.length)
				var computedQuantity = quantity;

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

		function updateReorderLevel (ingredient, reorderLevel) {
			db.updateOne (Ingredients, {_id:ingredient._id}, {reorderLevel:reorderLevel}, function(result){

			})
		}


		async function setReorder() {
			for (var i=0; i<reorderMultipliers.length; i++) {
				//get all ingredients with specific ingredient type
				var ingredients = await getIngredients(reorderMultipliers[i].typeID)

				//console.log(ingredients)

				updateMultiplier(reorderMultipliers[i])

				for (var j=0; j<ingredients.length; j++) {

					//console.log("j  " + j + "  ignredients length " + ingredients.length)

					var totalQuantity = 0;			//total quantity of ingredients needed to make all dishes with that ingredient
					var dishes = await getDishes(ingredients[j]._id);		//get all dishes that use the ingredient 

					//console.log(dishes.length)
					for (var k=0; k<dishes.length; k++) {

						var neededQuantity = dishes[k].quantity;

						//needs conversion, convert from dish unit to ingredient unit
						if (dishes[k].unitMeasurement != ingredients[j].unitMeasurement) {
							var conversion;

							//checks if there is direct converion
							conversion = await getConversion (dishes[k].unitMeasurement, ingredients[j].unitMeasurement);
							
							//no direct conversion, check for indirect conversions
							if (conversion == null || conversion == "") 
								conversion = await getIndirectConversion(dishes[k].unitMeasurement != ingredients[j].unitMeasurement);
							
							neededQuantity = await computeQuantity(dishes[k].quantity, conversion)
							//console.log(neededQuantity)
						}

						totalQuantity += neededQuantity
					}

					var reorderLevel = totalQuantity * reorderMultipliers[i].multiplier;
					updateReorderLevel (ingredients[j], reorderLevel)
					//console.log("reroder level: "+ ingredients[j].reorderLevel)
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
			return new Promise ((resolve, reject)=> {
				db.findMany(Sales, {}, 'date', function(result) {
					var uniqueDates = [];
					var unique = 1;

					for (var i=0; i<result.length; i++) {
						var date = new Date (result[i].date);
						var unique = 1;
						date.setHours(0,0,0,0);

						//checks if the date is new/unique, -1 means that it's not in the array
						for (var j=0; j < uniqueDates.length; j++) {
							var arrayDate = new Date (uniqueDates[j]);
							arrayDate.setHours(0,0,0,0);
							//console.log("date: " + date + ", array date: " + arrayDate);
							//console.log(uniqueDates);
							if (!(date > arrayDate || date < arrayDate)) {
								unique = 0;
								//console.log("not unique");
							}
						}
						
						if (unique == 1)
							uniqueDates.push(date)

						//console.log(uniqueDates);
					}
					resolve (uniqueDates)
				})
			})
		}


		function getSalesToday(dateToday) {
			return new Promise ((resolve, reject) => {
				dateToday.setHours(0,0,0,0);
				var sales = [];
				db.findMany (Sales, {}, '_id date', function(result) {
		            for (var i=0; i<result.length; i++) {
		                var date = new Date(result[i].date);
		                date.setHours(0,0,0,0);

		                //if (!(startDate > date || date > endDate))
						//if (date == dateToday)
						//console.log("date: " + date + " , dateToday: " + dateToday);
						if (!(date > dateToday || date < dateToday)) {
							//console.log("same date");
							sales.push(result[i]);
						}
					}
					console.log(sales);
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

		//converting from dishUnit to ingredientUnit
        function computeQuantityUsed(quantityUsed, conversion, orderQuantity) {
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
                resolve (computedQuantity*orderQuantity);
            }) 
        }

		function updateReorderLevel (ingredientID, used) {
			db.updateOne(Ingredients, {_id: ingredientID}, {reorderLevel:used}, function (result) {

			})
		}


		async function computeReorder() {
			var dailySales = [] 
			var totals = []

			var ingredients =await getIngredients();

			//get all days with sales in db
			var salesDay = await getSalesDays();

			console.log("sales day legnth " + salesDay.length)

			for (var i=0; i<salesDay.length	; i++) {
				//get sales id of sales made today
				//console.log("sales day: " + salesDay[i]);
				var salesToday = await getSalesToday(salesDay[i]);
				//console.log("sales today length " +  salesToday.length)

				for (var j=0; j<salesToday.length; j++) {
					var dishSales = await getDishSales(salesToday[j]._id)
					//console.log(dishSales)

					for (var k=0; k<dishSales.length; k++) {
						var dishIngredients = await getDishIngredients (dishSales[k].dishID)
						for (var l=0; l<dishIngredients.length; l++) {
							//console.log(dishIngredients.length)

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

	                                    ingredients[m].used += await computeQuantityUsed(parseFloat(dishIngredients[l].quantity), conversion, parseFloat(dishSales[k].quantity));
	                                }
	                               else {
	                                    //console.log(dishSales[j])
	                                    ingredients[m].used += (parseFloat(dishIngredients[l].quantity) * parseFloat(dishSales[k].quantity))            
	                                }
	                                //console.log(ingredients[m].used)
	                                //console.log("DISH IGNREDIETS " + dishIngredients[l].quantity +"  DISH SALES QUANITTY " + dishSales[k].quantity)
                                    
								}

							}
						}
					}
				}
				for (var n=0; n<ingredients.length; n++) {
					//console.log(ingredients[n]._id, ingredients[n].reorderLevel)
					//console.log(ingredients[n].used, ingredients[n].reorderLevel)
					if (ingredients[n].used > ingredients[n].reorderLevel) {
						updateReorderLevel(ingredients[n]._id, ingredients[n].used)
					}

					//make used 0 again for the next day
					ingredients[n].used = 0
				}
			}

		}

		computeReorder();
	}
};

module.exports = viewInventoryController;