// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Stock = require('../models/StockModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedStock = require('../models/PurchasedStockModel.js');

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
			for (var i=0; i<stock.length; i++) {
				var stock = {
				}
			}
		});

	}
}

module.exports = purchaseController;