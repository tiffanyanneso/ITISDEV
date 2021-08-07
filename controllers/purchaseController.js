// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Stock = require('../models/StockModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedStock = require('../models/PurchasedStockModel.js');

const Employees = require('../models/EmployeesModel.js');

const { json } = require('express');

const purchaseController = {

	renderPurchase: function (req, res) {
		var projection = 'stockID stockName quantity stockUnit';
		var stocks = [];
		db.findMany (Stock, {}, projection, function (result) {
			for (var i=0; i<result.length; i++) {
				var stock = {
					stockID: result[i].stockID,
					stockName: result[i].stockName,
					quantity: result[i].quantity,
					stockUnit: result[i].stockUnit
				}
				stocks.push(stock);
			}
			res.render('addStock', {stocks});
		})
	},

	getStockName: function (req, res) {
		 var stockID = req.query.stockID;

        var projection = 'stockID stockName quantity stockUnit';

        db.findOne(Stock, {stockID: stockID}, projection, function(result) {
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
		}

		var purchaseID;
		//store to Purchases
		db.insertOneResult(Purchases, purchaseDetails, function (result) {
			purchaseID = result._id;

			for (var i=0; i<stocks.length; i++)
				stocks[i].purchaseID = purchaseID;

			//store individual purhcased stock
			db.insertMany (PurchasedStock, stocks, function(flag) {
				if (flag) { }
			});
			
		});
	},

	// render existing purchases
    getViewPurchases: function (req, res) {
        var projection = '_id purchaseID dateBought total employeeID';
        var purchases = [];

        db.findMany (Purchases, {}, projection, function(result) {
			
			for (var i = 0; i < result.length; i++) {
                var date = new Date(result[i].dateBought);

                var purchase = {
                    systemID: result[i]._id,
                    purchaseID: result[i].purchaseID,
                    dateBought: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                    total: result[i].total,
                    employeeID: result[i].employeeID,
                    employeeName : "name"
                };

                purchases.push(purchase);
            }

            db.findMany (Employees, {}, 'employeeID name', function(result2) {
                var employeeName = result2.name;


                for (var k = 0; k < purchases.length; k++) {
                    for (var l = 0; l < result2.length; l++) {
                        if (purchases[k].employeeID == result2[l].employeeID)
                                purchases[k].employeeName = result2[l].name;
                            //console.log(purchases[k].employeeID + ", " + result2[l].employeeID);
                    }
                }
                //console.log(purchases);
                res.render('viewPurchases', {purchases});
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
    			var projection2 = 'stockID unitPrice count';

    			//find all purchased stock
    			db.findMany(PurchasedStock, {purchaseID:req.params.systemID}, projection2, function(result3) {
    				var purchasedStocks = [];
    				var stockInfos = [];

    				for (var i=0; i<result3.length; i++) {
    					var purchasedStock = {
    						count: result3[i].count,
    						unitPrice: result3[i].unitPrice,
    						amount: result3[i].unitPrice * result3[i].count
    					}
    					purchasedStocks.push(purchasedStock);

    					var projection3 = 'stockID stockName quantity stockUnit';

    					db.findOne (Stock, {stockID:result3[i].stockID}, projection3, function(result4) {
    			
    						var stockInfo = {
    							stockID: result4.stockID,
    							stockName: result4.stockName,
    							quantity: result4.quantity,
    							unit: result4.stockUnit
    						};
    						stockInfos.push (stockInfo);
    						console.log("**stockInfos");
    						console.log(stockInfos);
    						console.log("**stockInfo");
    						console.log(stockInfo);
    					});	
    					console.log(stockInfos);
    					
    				}    				
    				res.render ('viewSpecificPurchase', {purchase, employeeName, purchasedStocks, stockInfos});
    			});
    			
    		});
    		
    	});
    }
}

module.exports = purchaseController;