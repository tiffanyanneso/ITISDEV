// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Stock = require('../models/StockModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedStock = require('../models/PurchasedStockModel.js');

const Employees = require('../models/EmployeesModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const Units = require('../models/UnitsModel.js');

const Conversion = require('../models/ConversionModel.js');

const { json } = require('express');

const purchaseController = {

	renderPurchase: function (req, res) {

		db.findMany (Units, {}, '_id unit', function (result) {
			var units = [];
			for (var i=0; i<result.length; i++) {
				var unit = {
					id:result[i]._id,
					unitName:result[i].unit
				};
				units.push (unit);
			}
			res.render('addStock', {units});
		});

		/*function getUnitName(unitId) {
			return new Promise ((resolve, reject) => {
				db.findOne (Units, {_id:unitId}, 'unit', function(result){
					if (result!="")
						resolve(result.unit);
				})
			})
		}

		async function getUnit (stocks) {
			for (var i=0; i<stocks.length; i++) 
				stocks[i].stockUnit  = await getUnitName (stocks[i].stockUnit	);
			
			db.findMany (Units, {}, '_id unit', function (result) {
				var units = [];
				for (var i=0; i<result.length; i++) {
					var unit = {
						id:result[i]._id,
						unitName:result[i].unit
					};
					units.push (unit);
				}
				res.render('addStock', {stocks, units});
			})
			
		}
		
		var projection = 'stockName quantity stockUnit';
		var stocks = [];
		db.findMany (Stock, {}, projection, function (result) {
			for (var i=0; i<result.length; i++) {
				var stock = {
					stockName: result[i].stockName,
					quantity: result[i].quantity,
					stockUnit: result[i].stockUnit
				}
				stocks.push(stock);
			}
			getUnit (stocks);
		});*/
	},

	getStockName: function (req, res) {
		//$options:i denotes case insensitive searching
		db.findMany (Stock, {stockName:{$regex:req.query.query, $options:'i'}}, 'stockName', function (result) {
			var formattedResults = [];
			//reason for the for loop: https://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
			for (var i=0; i<result.length; i++) {
				var formattedResult = {
					label: result[i].stockName,
					value: result[i].stockName
				};
				formattedResults.push(formattedResult);
			}
			res.send(formattedResults);
		});
	},

	getStockInfo: function (req, res) {
        var projection = 'quantity stockUnit';

        db.findOne(Stock, {stockName: req.query.stockName}, projection, function(result) {
        	db.findOneExtraParam (Units, {_id:result.stockUnit}, 'unit', result, function (result2, result) {
        		result.stockUnit = result2.unit;
        		res.send(result);
        	})
        });
	},

	savePurchase: function(req, res) {

		function getStockID (stockName) {
			return new Promise((resolve, reject) => {
				db.findOne (Stock, {stockName:stockName}, '_id', function (result) {
					console.log(result);
					if (result!="") 
						resolve(result._id); 
				})
			})
		}
		function getRatioAndOperator (purchasedUnit, ingredientUnit) {
			return new Promise((resolve, reject) => {
				db.findOne (Conversion, {$and:[ {unitA:purchasedUnit}, {unitB:ingredientUnit} ]}, 'ratio operator', function(result){
					if (result!="") 
						resolve(result);
				})
			})
		}

		function getCurrentAvailable (ingredientID) {
			return new Promise ((resolve, reject) => {
				db.findOne (Ingredients, {_id:ingredientID}, 'quantityAvailable', function(result) {
					if (result!="")
						resolve(result);
				})
			})
		}

		//info in ingredient is ingredientName, unit, quantityAvailable
		async function computeNewQuantity(quantity, purchasedUnit, ingredient) {
			var purchasedQuantity;
			//same unit, no need for conversion
			if (purchasedUnit == ingredient.unitMeasurement)
				purchasedQuantity = quantity;

			//needs conversion
			else {
				var ratioAndOperator = await getRatioAndOperator(purchasedUnit, ingredient.unitMeasurement);
				var ratio = ratioAndOperator.ratio;
				if (ratioAndOperator.operator == "*")
					purchasedQuantity = quantity*ratio;
				else
					purchasedQuantity = quantity/ratio;
			}

			var currentQuantity = await getCurrentAvailable (ingredient._id);
			var newQuantity = currentQuantity.quantityAvailable + purchasedQuantity;

			//update quantityAvailable in ingredient
			db.updateOne (Ingredients, {ingredientID: ingredient.ingredientID}, {quantityAvailable:newQuantity}, function(flag) {

			});
		}

		async function stockID (stocks, purchaseID) {
			for (var i=0; i<stocks.length; i++) {
				stocks[i].purchaseID = purchaseID;
				stocks[i].stockID = await getStockID(stocks[i].stockName);
			}

			//store individual purhcased stock
			db.insertManyResult (PurchasedStock, stocks, function(result2) {
				for (j=0; j<result2.length; j++) {
					var currentStock = result2[j];		//data here is stockName, count, unitPrice

					//compute total quantity purchased - look for stock name to get the quantity of the stock
					db.findOneExtraParam (Stock, {_id: result2[j].stockID}, 'ingredientID quantity stockUnit', currentStock, function (result3, currentStock) {

						var purchasedQuantity = currentStock.count * result3.quantity;
						var purchasedUnit = result3.stockUnit;

						//look for ingredient to get currentAvailableQuantity
						db.findOneExtraParams (Ingredients, {_id:result3.ingredientID}, '_id quantityAvailable unitMeasurement', purchasedQuantity, purchasedUnit, function (result4, purchasedQuantity, purchasedUnit) {
							computeNewQuantity(purchasedQuantity, purchasedUnit, result4);							
						});
					});
				}
			});
		}

		var datePurchased = new Date();
		var stocks = JSON.parse(req.body.stockString);
		var purchaseTotal = req.body.purchaseTotal;


		var purchaseDetails = {
			dateBought: datePurchased,
			total: purchaseTotal,
			employeeID: "610c0a3a76be1fa0308b0ef5"
		};

		var purchaseID;
		//store to Purchases
		db.insertOneResult(Purchases, purchaseDetails, function (result) {
			purchaseID = result._id;
			stockID(stocks, purchaseID);
		});
	},

	// render existing purchases
    getViewPurchases: function (req, res) {
        var projection = '_id dateBought total employeeID';
		var purchases = [];
		var today = new Date().toLocaleString('en-US');

        db.findMany (Purchases, {}, projection, function(result) {
			
			for (var i = 0; i < result.length; i++) {
                var date = new Date(result[i].dateBought);

                var purchase = {
                    systemID: result[i]._id,
                   // purchaseID: result[i].purchaseID,
                    dateBought: date.toLocaleString('en-US'),
                    total: parseFloat(result[i].total).toFixed(2),
                    employeeID: result[i].employeeID,
                    employeeName : "name"
                };

                purchases.push(purchase);
            }

            db.findMany (Employees, {}, '_id name', function(result2) {
				//var employeeName = result2.name;
				
				var total = 0;

                for (var k = 0; k < purchases.length; k++) {
					total += parseFloat(purchases[k].total);
                    for (var l = 0; l < result2.length; l++) {
                        if (purchases[k].employeeID == result2[l]._id)
                                purchases[k].employeeName = result2[l].name;
                            //console.log(purchases[k].employeeID + ", " + result2[l].employeeID);
                    }
				}

				total = total.toFixed(2);

				purchases.reverse();

                //console.log(purchases);
                res.render('viewPurchases', {purchases, total, today});
            });
        });
    },

    viewSpecificPurchase: function (req, res) {

    	function getStocksPurchased(purchaseID){
    		return new Promise ((resolve, reject) => {
	    		var purchasedStocks = [];
	    		var projection = 'stockID unitPrice count';
	    		db.findMany (PurchasedStock, {purchaseID:purchaseID}, projection, function(result) {
	    			for (var i=0; i<result.length; i++) {
		    			var purchasedStock = {
		    				stockID:result[i].stockID,
							count: result[i].count,
							unitPrice: result[i].unitPrice,
							amount: result[i].unitPrice * result[i].count
						};
						purchasedStocks.push(purchasedStock);
					}
					if (purchasedStocks.length>0)
		    			resolve(purchasedStocks);
	    		
    			});
    		})
    	}

    	function getStockInfo (purchasedStock) {
    		return new Promise ((resolve, reject) => {
				var projection = 'stockName quantity stockUnit';
				db.findOne(Stock, {_id:purchasedStock.stockID}, projection, function(result) {
					db.findOne(Units, {_id:result.stockUnit}, 'unit', function (result1) {
						result.stockUnit  = result1.unit;
						if (result!="")
							resolve(result);
					})
				})
			})
    	}

    	async function getPurchasedStocks(purchaseID, purchase, employeeName) {
			try {
				var purchasedStocks = await getStocksPurchased(purchaseID);
				var stockInfos = [];
				for (var i=0; i<purchasedStocks.length; i++) {
					var stockInfo = await getStockInfo (purchasedStocks[i]);
					console.log(stockInfo);
					purchasedStocks[i].stockName = stockInfo.stockName;
					purchasedStocks[i].quantity  = stockInfo.quantity;
					purchasedStocks[i].stockUnit = stockInfo.stockUnit;
				}		
				res.render ('viewSpecificPurchase', {purchase, employeeName, purchasedStocks});
			} catch (err) {
				console.log(err);
			}
		}

    	var projection = '_id dateBought total employeeID';
    	var id = req.params.systemID;

    	//find specific purchase id
    	db.findOne (Purchases, {_id:id}, projection, function(result) {
    		var purchase = result;

    		//find employee name
    		db.findOne (Employees, {_id:result.employeeID}, 'name', function (result2) {
    			var employeeName = result2.name;
    			//var projection2 = 'stockName unitPrice count';

    			//find all purchased stock and their info
    			getPurchasedStocks(id, purchase, employeeName)
				
    		});
    	});
	},
	
	getSearchPurchase: function(req, res) {
		var _id = req.query._id;
		var projection = '_id dateBought total employeeID';

		db.findOne(Purchases, {_id: _id}, projection, function (result) {
			console.log(result);
			res.send(result);

			/*if (_id == result._id) {
				var employeeID = result.employeeID;
			
				db.findOne(Employees, {employeeID: employeeID}, 'name', function(result2) {
					
				});
	
				
			}*/
        });
	},

	getEmployeeName: function(req, res) {
		var employeeID = req.query.employeeID;
		//var projection = '_id dateBought total employeeID';

		db.findOne(Employees, {employeeID: employeeID}, 'name', function (result2) {
			console.log(result2);
			res.send(result2);

			/*if (_id == result._id) {
				var employeeID = result.employeeID;
			
				db.findOne(Employees, {employeeID: employeeID}, 'name', function(result2) {
					
				});
	
				
			}*/
        });
	},

	getFilteredRows: function(req, res) {
		var startDate = new Date(req.query.startDate);
		var endDate = new Date(req.query.endDate);
		startDate.setHours(0,0,0,0);
		endDate.setHours(0,0,0,0);

		var projection = '_id dateBought total employeeID';
		var purchases = [];
		
		db.findMany(Purchases, {}, projection, function(result) {
			for (var i = 0; i < result.length; i++) {
				var date = new Date(result[i].dateBought);
				date.setHours(0,0,0,0);
				
				if (!(startDate > date || date > endDate)) {
					var purchase = {
						systemID: result[i]._id,
						dateBought: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
						total: parseFloat(result[i].total).toFixed(2),
						employeeID: result[i].employeeID,
						employeeName : "name"
					};
	
					purchases.push(purchase);
				}
			}

			db.findMany (Employees, {}, '_id name', function(result2) {
				//var employeeName = result2.name;
				
				//var total = 0;

                for (var k = 0; k < purchases.length; k++) {
					// total += parseFloat(purchases[k].total);
                    for (var l = 0; l < result2.length; l++) {
                        if (purchases[k].employeeID == result2[l]._id)
                                purchases[k].employeeName = result2[l].name;
                            //console.log(purchases[k].employeeID + ", " + result2[l].employeeID);
                    }
				}

				console.log(purchases);

				res.send(purchases);
            });
		});
	}
};

module.exports = purchaseController;