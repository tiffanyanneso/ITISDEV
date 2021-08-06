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

		var puchaseID;
		//store to Purchases
		db.insertOne(Purchases, purchaseDetails, function (flag) {
			if (flag) { }
		});

		//get puchase id from insertOne


		//store individual purhcased stock
		db.insertMany(PurchasedStock, stocks, function(flag) {
			if (flag) { }
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
    }
}

module.exports = purchaseController;