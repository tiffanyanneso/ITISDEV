// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Stocks = require('../models/StockModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const Units = require('../models/UnitsModel.js');

const Conversion = require('../models/ConversionModel.js');

const Shrinkages = require('../models/ShrinkageModel.js');

const Employees = require('../models/EmployeesModel.js');

const manualCountController = {

	getUpdatePage: function (req,res) {

		function getUnitName(unitId) {
			return new Promise ((resolve, reject) => {
				db.findOne (Units, {_id:unitId}, 'unit', function(result){
					if (result!="")
						resolve(result.unit);
				});
			});
		}

		async function getUnit (stocks) {
			for (var i=0; i<stocks.length; i++) {
				var unitName = await getUnitName (stocks[i].stockUnit);
				stocks[i].stockUnit = unitName;
			}
			var ingredientID = req.params.ingredientID
			res.render('updateManualCount', {ingredientID, stocks});
		}

		var projection = 'stockName quantity stockUnit'
		db.findMany (Stocks, {ingredientID:req.params.ingredientID}, projection, function (result) {
			getUnit (result);
		});
	},

	saveManualCount: function (req, res) {
		var ingredientID = req.body.ingredientID;
		var stocks = JSON.parse(req.body.stockString); 		//contains stockname and count of that stock
		
		
		function getIngredientUnit(ingredientID) {
			return new Promise ((resolve, reject) => {
				db.findOne(Ingredients, {_id:ingredientID}, 'unitMeasurement', function (result) {
					if (result!="")
						resolve(result);
				});
			}); 
		}

		function getStockUnit (stockName) {
			return new Promise ((resolve, reject) => {
				db.findOne(Stocks, {stockName: stockName}, 'stockUnit', function (result) {
					if (result!="")
						resolve(result);
				});
			});
		}

		function computeQuantity (stock) {
			return new Promise ((resolve, reject)=> {
				db.findOne(Stocks, {stockName: stock.stockName}, 'quantity', function (result) {
					if (result!="") {
						var manualCount = stock.manualCount * result.quantity;
						resolve(manualCount);
					}
				});
			});
		}

		function convertQuantity(quantity, stockUnit, ingredientUnit) {
			return new Promise ((resolve, reject) => {
				db.findOne (Conversion,  {$and:[ {unitA:stockUnit}, {unitB:ingredientUnit} ]}, 'ratio operator', function(result){
					var convertedQuantity;
					var ratio = result.ratio;

					if (result.operator == "*")
						convertedQuantity = quantity*ratio;
					else
						convertedQuantity = quantity/ratio;

					resolve(convertedQuantity);
				});
			});
		}

		function getSystemCount (ingredientID) {
			return new Promise ((resolve, reject) => {
				db.findOne (Ingredients, {_id:ingredientID}, 'quantityAvailable', function (result) {
					if (result!="")
						resolve (result);
				});
			});
		}
		

		async function manualCount() {
			var ingredientUnit = await getIngredientUnit(ingredientID);
			var manualCount = 0;
			for (var i=0; i<stocks.length; i++) {
				var stockUnit = await getStockUnit(stocks[i].stockName);
				var quantity =0;

				quantity += parseInt(await computeQuantity(stocks[i]));

				//needs conversion
				if (stockUnit.stockUnit !=ingredientUnit.unitMeasurement)
					manualCount += parseInt(await convertQuantity(quantity, stockUnit.stockUnit, ingredientUnit.unitMeasurement));
				else
					manualCount += quantity;			
			}
			var systemCount = await getSystemCount(ingredientID);
			
			//there is descrepancy
			if (systemCount.quantityAvailable != manualCount) {
				var dateReported = new Date();
				var shrinkage = {
					ingredientID: ingredientID,
					date: dateReported,
					systemCount: systemCount.quantityAvailable,
					manualCount: manualCount,
					employeeID: '610c0a3a76be1fa0308b0ef5'
				};
				db.insertOne (Shrinkages, shrinkage, function (flag) {
					if (flag) {
						db.updateOne (Ingredients, {_id:ingredientID}, {quantityAvailable:manualCount}, function(flag) {
							if (flag) {
								console.log("insert redirect");
							}
						});
					}

				});
			}
			else {
				console.log("redirect?");
				res.redirect('/ingredient/' + ingredientID);
			}
		}

		manualCount();
	},

	getViewShrinkages: function (req,res) {
		var today = new Date().toLocaleString('en-US');
		var projection = '_id ingredientID date systemCount manualCount employeeID reason';
		var shrinkages = [];

		db.findMany (Shrinkages, {}, projection, function (result) {
			for (var i = 0; i < result.length; i++) {

				var date = new Date(result[i].date);

				var shrinkage = {
					ingredientID: result[i].ingredientID,
					ingredientName: "Ingredient Name",
					ingredientUnit: "Unit",
					date: date.toLocaleString('en-US'),
					systemCount: result[i].systemCount,
					manualCount: result[i].manualCount,
					employee: result[i].employeeID,
					reason: result[i].reason
				};
	
				shrinkages.push(shrinkage);
			}

			function getIngredientInfo (ingredientID) {
				return new Promise ((resolve, reject) => {
					db.findOne (Ingredients, {_id:ingredientID}, 'ingredientName unitMeasurement', function(result) {

						var info = {
							ingredientName: result.ingredientName,
							unitMeasurement: result.unitMeasurement,
							unitName: "Unit Name"
						};

						db.findOne (Units, {_id: info.unitMeasurement}, 'unit', function(result2) {
							info.unitName = result2.unit;

							if (result!="" && result2!="")
								resolve(info);
						});
					});
				});
			}

			function getEmployeeName (employeeID) {
				return new Promise ((resolve, reject) => {
					db.findOne (Employees, {_id: employeeID}, 'name', function(result) {
						if (result!="")
							resolve(result.name);
					});
				});
			}

			async function getNames(shrinkages, today) {
				for (var i = 0; i < shrinkages.length; i++) {
					var ingredient = await getIngredientInfo(shrinkages[i].ingredientID);
					shrinkages[i].ingredientName = ingredient.ingredientName;
					shrinkages[i].ingredientUnit = ingredient.unitName;

					shrinkages[i].employee = await getEmployeeName(shrinkages[i].employee);
				}
			
				res.render('viewShrinkages', {shrinkages, today});
			}

			getNames(shrinkages, today);
		});	
	},

	getFilteredRowsViewShrinkages: function(req, res) {
		var startDate = new Date(req.query.startDate);
		var endDate = new Date(req.query.endDate);
		startDate.setHours(0,0,0,0);
		endDate.setHours(0,0,0,0);
		var today = new Date().toLocaleString('en-US');

		var projection = '_id ingredientID date systemCount manualCount employeeID reason';
		var shrinkages = [];
		
		db.findMany(Shrinkages, {}, projection, function(result) {
			for (var i = 0; i < result.length; i++) {
				var date = new Date(result[i].date);
				var date2 = new Date(result[i].date);
				date.setHours(0,0,0,0);
				
				if (!(startDate > date || date > endDate)) {
					var shrinkage = {
						ingredientID: result[i].ingredientID,
						ingredientName: "Ingredient Name",
						ingredientUnit: "Unit",
						date: date2.toLocaleString('en-US'),
						systemCount: result[i].systemCount,
						manualCount: result[i].manualCount,
						employee: result[i].employeeID,
						reason: result[i].reason
					};
		
					shrinkages.push(shrinkage);
				}
			}

			function getIngredientInfo (ingredientID) {
				return new Promise ((resolve, reject) => {
					db.findOne (Ingredients, {_id:ingredientID}, 'ingredientName unitMeasurement', function(result) {

						var info = {
							ingredientName: result.ingredientName,
							unitMeasurement: result.unitMeasurement,
							unitName: "Unit Name"
						};

						db.findOne (Units, {_id: info.unitMeasurement}, 'unit', function(result2) {
							info.unitName = result2.unit;

							if (result!="" && result2!="")
								resolve(info);
						});
					});
				});
			}

			function getEmployeeName (employeeID) {
				return new Promise ((resolve, reject) => {
					db.findOne (Employees, {_id: employeeID}, 'name', function(result) {
						if (result!="")
							resolve(result.name);
					});
				});
			}

			async function getNames(shrinkages, today) {
				for (var i = 0; i < shrinkages.length; i++) {
					var ingredient = await getIngredientInfo(shrinkages[i].ingredientID);
					shrinkages[i].ingredientName = ingredient.ingredientName;
					shrinkages[i].ingredientUnit = ingredient.unitName;

					shrinkages[i].employee = await getEmployeeName(shrinkages[i].employee);
				}
				res.send(shrinkages);
			}

			getNames(shrinkages, today);	
		});
	},

	getDateToday: function(req, res) {
		var today = new Date().toLocaleString('en-US');

		res.send(today);
	}
};

module.exports = manualCountController;