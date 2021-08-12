// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Stock = require('../models/StockModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedStock = require('../models/PurchasedStockModel.js');

const Employees = require('../models/EmployeesModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const { json } = require('express');

const purchaseController = {

	renderPurchase: function (req, res) {
		var projection = 'stockName quantity stockUnit';
		var stocks = [];
		db.findMany (Stock, {}, projection, function (result) {
			for (var i=0; i<result.length; i++) {
				var stock = {
					stockName: result[i].stockName,
					quantity: result[i].quantity,
					stockUnit: result[i].stockUnit
				};
				stocks.push(stock);
			}
			res.render('addStock', {stocks});
		});
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
				}
				formattedResults.push(formattedResult);
			}
			res.send(formattedResults);
		})
	},

	getStockInfo: function (req, res) {

        var projection = 'quantity stockUnit';

        db.findOne(Stock, {stockName: req.query.stockName}, projection, function(result) {
            res.send(result);
        });
	},

	addPurchase: function(req, res) {
		var datePurchased = req.body.datePurchased;
		var stocks = JSON.parse(req.body.stockString);
		var purchaseTotal = req.body.purchaseTotal;


		var purchaseDetails = {
			dateBought: datePurchased,
			total: purchaseTotal,
			employeeID: 1
		};

		var purchaseID;
		//store to Purchases
		db.insertOneResult(Purchases, purchaseDetails, function (result) {
			purchaseID = result._id;

			for (var i=0; i<stocks.length; i++)
				stocks[i].purchaseID = purchaseID;

			//store individual purhcased stock
			db.insertManyResult (PurchasedStock, stocks, function(result2) {
				for (j=0; j<result2.length; j++) {
					var currentStock = result2[j];

					//compute total quantity purchased
					db.findOneExtraParam (Stock, {stockName: result2[j].stockName}, 'ingredientName quantity', currentStock, function (result3, currentStock) {
						var purchasedQuantity = currentStock.count * result3.quantity

						//look for ingredient to get currentAvailableQuantity
						db.findOneExtraParam (Ingredients, {ingredientName:result3.ingredientName}, 'ingredientID quantityAvailable', purchasedQuantity, function (result4, purchasedQuantity) {
							var currentQuantity = purchasedQuantity + result4.quantityAvailable;
							console.log("totalQ " + currentQuantity);

							//update quantityAvailable in ingredient
							db.updateOne (Ingredients, {ingredientName: result4.ingredientName}, {quantityAvailable:currentQuantity}, function(flag) {

							});
						});
					});
				}
			});


			
		});
	},

	// render existing purchases
    getViewPurchases: function (req, res) {
        var projection = '_id dateBought total employeeID';
        var purchases = [];

        db.findMany (Purchases, {}, projection, function(result) {
			
			for (var i = 0; i < result.length; i++) {
                var date = new Date(result[i].dateBought);

                var purchase = {
                    systemID: result[i]._id,
                   // purchaseID: result[i].purchaseID,
                    dateBought: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                    total: parseFloat(result[i].total).toFixed(2),
                    employeeID: result[i].employeeID,
                    employeeName : "name"
                };

                purchases.push(purchase);
            }

            db.findMany (Employees, {}, 'employeeID name', function(result2) {
				//var employeeName = result2.name;
				
				var total = 0;

                for (var k = 0; k < purchases.length; k++) {
					total += parseFloat(purchases[k].total);
                    for (var l = 0; l < result2.length; l++) {
                        if (purchases[k].employeeID == result2[l].employeeID)
                                purchases[k].employeeName = result2[l].name;
                            //console.log(purchases[k].employeeID + ", " + result2[l].employeeID);
                    }
				}

				total = total.toFixed(2);

				purchases.reverse();

                //console.log(purchases);
                res.render('viewPurchases', {purchases, total});
            });
        });
    },

    viewSpecificPurchase: function (req, res) {
    	var projection = '_id dateBought total employeeID';

    	//find specific purchase id
    	db.findOne (Purchases, {_id:req.params.systemID}, projection, function(result) {
    		var purchase = result;
    		//find employee name
    		db.findOne (Employees, {employeeID:result.employeeID}, 'name', function (result2) {
    			var employeeName=result2.name;
    			var projection2 = 'stockName unitPrice count';

    			//find all purchased stock
    			
    			db.findMany(PurchasedStock, {purchaseID:req.params.systemID}, projection2, function(result3) {
    				var purchasedStocks = [];
    				var stockInfos = [];

    				for (var i=0; i<result3.length; i++) {
    					var purchasedStock = {
    						count: result3[i].count,
    						unitPrice: result3[i].unitPrice,
    						amount: result3[i].unitPrice * result3[i].count
    					};
						purchasedStocks.push(purchasedStock);

						var projection3 = 'stockName quantity stockUnit';

						db.findOne (Stock, {stockID:result3[i].stockName}, projection3, function(result4) {
				
							var stockInfo = {
								stockName: result4.stockName,
								quantity: result4.quantity,
								unit: result4.stockUnit
							};
							stockInfos.push (stockInfo);
							//everything displays here
							/*console.log("**stockInfos");
							console.log(stockInfos);
							console.log("**stockInfo");
							console.log(stockInfo);*/
						});	
    				} 
    				//does not display here
    				console.log(stockInfos);				
    				res.render ('viewSpecificPurchase', {purchase, employeeName, purchasedStocks, stockInfos});
    			});
    			
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

			db.findMany (Employees, {}, 'employeeID name', function(result2) {
				//var employeeName = result2.name;
				
				//var total = 0;

                for (var k = 0; k < purchases.length; k++) {
					// total += parseFloat(purchases[k].total);
                    for (var l = 0; l < result2.length; l++) {
                        if (purchases[k].employeeID == result2[l].employeeID)
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