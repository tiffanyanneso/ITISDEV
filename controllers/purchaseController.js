// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Stock = require('../models/StockModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedStock = require('../models/PurchasedStockModel.js');

const Employees = require('../models/EmployeesModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const IngredientTypes =require('../models/IngredientTypesModel.js');

const Units = require('../models/UnitsModel.js');

const Conversion = require('../models/ConversionModel.js');

const { json } = require('express');

const purchaseController = {

	renderPurchase: function (req, res) {

		function getUnits() {
			return new Promise ((resolve, reject) => {
				db.findMany (Units, {}, '_id unit', function(result){
					if (result!="")
						resolve(result);
				})
			})
		}

		function getIngredientTypes() {
			return new Promise((resolve, reject) => {
				db.findMany (IngredientTypes, {}, '_id ingredientType', function(result) {
					if (result!="")
						resolve(result)
				})
			})
		}

		async function getInfoAndRender() {
			var units = await getUnits();
			var ingredientTypes  = await getIngredientTypes();
			res.render('addStock', {units, ingredientTypes});
		}

		if( req.session.position != 'Inventory' && req.session.position != 'Purchasing' ){
			res.redirect('/dashboard');
		}
		else{		
			getInfoAndRender();
		}
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

		function insertPurchasedStocks(stocks) {
			return new Promise ((resolve, reject) => {
				db.insertManyResult(PurchasedStock, stocks, function (result) {
					resolve (result);
				})
			})
		}

		function getStockInfo (stockID) {
			return new Promise((resolve, reject)=> {
				db.findOne(Stock, {_id:stockID}, 'ingredientID quantity stockUnit', function(result) {
					if (result!="")
						resolve(result)
				})
			}) 
		}

		function getIngredientInfo (ingredientID) {
			return new Promise ((resolve, reject) => {
				db.findOne (Ingredients, {_id:ingredientID}, '_id quantityAvailable unitMeasurement', function(result) {
					if (result!="")
						resolve(result);
				})
			})
		}

		function getRatioAndOperator (purchasedUnit, ingredientUnit) {
			return new Promise((resolve, reject) => {
				db.findOne (Conversion, {$and:[ {unitA:purchasedUnit}, {unitB:ingredientUnit} ]}, 'ratio operator', function(result){
					console.log(result)
					if (result!="") 
						resolve(result);
				})
			})
		}


		function updateQuantity (ingredientID, newQuantity) {
			db.updateOne (Ingredients, {_id:ingredientID}, {quantityAvailable:newQuantity}, function (result) {

			})
		}


		async function savePurchasedStock (stocks, purchaseID) {
			for (var i=0; i<stocks.length; i++) {
				stocks[i].purchaseID = purchaseID;
				stocks[i].stockID = await getStockID(stocks[i].stockName);
			}

			//store individual purhcased stock
			var purchasedStocks = await insertPurchasedStocks(stocks);

			for (var j=0; j<purchasedStocks.length; j++) {

				//compute total quantity purchased - look for stock id to get the quantity of the stock
				var stockInfo = await getStockInfo(purchasedStocks[j].stockID)
				var purchasedQuantity = stockInfo.quantity * purchasedStocks[j].count

				//look for ingredient to get currentAvailableQuantity and unit
				var ingredientInfo = await getIngredientInfo(stockInfo.ingredientID);

				//stock unit is not equal to ingredient unit
				if (stockInfo.stockUnit != ingredientInfo.unitMeasurement) {
					var ratioAndOperator = await getRatioAndOperator(stockInfo.stockUnit, ingredientInfo.unitMeasurement);
					var ratio = ratioAndOperator.ratio;
					if (ratioAndOperator.operator == "*")
						purchasedQuantity = stockInfo.quantity*ratio;
					else
						purchasedQuantity = stockInfo.quantity/ratio;
				}

				var newQuantity = ingredientInfo.quantityAvailable + purchasedQuantity;

				updateQuantity (ingredientInfo._id, newQuantity)
			}
			res.redirect('/purhcase/' + purchaseID)
		}

		var datePurchased = new Date();
		var stocks = JSON.parse(req.body.stockString);
		var purchaseTotal = req.body.purchaseTotal;


		var purchaseDetails = {
			dateBought: datePurchased,
			total: purchaseTotal,
			employeeID: req.session._id
		};

		var purchaseID;
		//store to Purchases
		db.insertOneResult(Purchases, purchaseDetails, function (result) {
			purchaseID = result._id;
			savePurchasedStock(stocks, purchaseID);
		});
	},

	// render existing purchases
    getViewPurchases: function (req, res) {

    	if( req.session.position != 'Inventory' && req.session.position != 'Purchasing' && req.session.position != 'Admin' ){
			res.redirect('/dashboard');
		}
		else{	

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

                if(req.session.position == "Inventory"  || req.session.position == "Purchasing"){
                	var inventory = req.session.position;
                	 res.render('viewPurchases', {purchases, total, today, inventory});
                }

                if(req.session.position == "Admin"){
                	var manager = req.session.position;
                	 res.render('viewPurchases', {purchases, total, today, manager});
                }
               
            });
        });
    	}
    },

    viewSpecificPurchase: function (req, res) {

    	if( req.session.position != 'Inventory' && req.session.position != 'Purchasing' && req.session.position != 'Admin' ){
			res.redirect('/dashboard');
		}
		else{	

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
    		});
    	}

    	function getStockInfo (purchasedStock) {
    		return new Promise ((resolve, reject) => {
				var projection = 'stockName quantity stockUnit';
				db.findOne(Stock, {_id:purchasedStock.stockID}, projection, function(result) {
					db.findOne(Units, {_id:result.stockUnit}, 'unit', function (result1) {
						result.stockUnit  = result1.unit;
						if (result!="")
							resolve(result);
					});
				});
			});
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

				if(req.session.position == "Inventory" || req.session.position == "Purchasing"){
                	var inventory = req.session.position;
                	res.render ('viewSpecificPurchase', {purchase, employeeName, purchasedStocks, inventory});
                }

                if(req.session.position == "Admin"){
                	var manager = req.session.position;
                	res.render ('viewSpecificPurchase', {purchase, employeeName, purchasedStocks, manager});
                }

				

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
    			getPurchasedStocks(id, purchase, employeeName);
				
    		});
    	});
    	}
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