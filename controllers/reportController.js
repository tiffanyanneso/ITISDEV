
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Ingredients = require('../models/IngredientsModel.js');

const Stock = require('../models/StockModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedStock = require('../models/PurchasedStockModel.js');

const Units = require('../models/UnitsModel.js');

const Dishes = require('../models/DishesModel.js');

const Sales = require('../models/SalesModel.js');

const SalesDishes = require('../models/SalesDishesModel.js');

//import models

const reportController = {

    getSalesReport: function (req, res) {
        var today = new Date().toLocaleString('en-US');
        var dishes = [];
        var total = 0;
        var discount = 0;
        var VAT = 0;

        var projection = '_id dishName dishPrice dishClassification';

        db.findMany(Dishes, {}, projection, function(result) {

            for (var i = 0; i < result.length; i++) {
                var dish = {
                    _id: result[i]._id,
                    dishName: result[i].dishName,
                    count: 0,
                    price: parseFloat(result[i].dishPrice).toFixed(2),
                    total: 0
                };

                //dish.total = parseFloat(dish.count * dish.price).toFixed(2);
                //total += dish.total;
                dishes.push(dish);
            }

            //console.log(dishes);

            // look through sales 
            var projection2 = '_id date total VAT discount';
            db.findMany(Sales, {}, projection2, function(result2) {
                var salesIDs = [];

                for (var j = 0; j < result2.length; j++) {
                    VAT += result2[j].VAT;
                    discount += result2[j].discount;
                    total += result2[j].total;

                    salesIDs.push(result2[j]._id);
                }

                //console.log(salesIDs);
                //console.log(result2);
                VAT = parseFloat(VAT).toFixed(2);
                discount = parseFloat(discount).toFixed(2);
                total = parseFloat(total).toFixed(2);

                function getSalesDish (saleID) {
                    return new Promise ((resolve, reject) => {
                        db.findMany (SalesDishes, {salesID: saleID}, 'salesID dishID quantity', function(result) {
                            //if (result!="")
                                resolve(result);
                        });
                    });
                }

                async function getCount(today, dishes, total, discount, VAT, salesIDs) {
                    for (var k = 0; k < salesIDs.length; k++) {
                        //console.log(salesIDs[k]);

                        // get salesID dishID quantity
                        var salesDish = await getSalesDish(salesIDs[k]);

                        for (var l = 0; l < salesDish.length; l++) {
                            var dishID = salesDish[l].dishID;
                            var quantity = salesDish[l].quantity;
                            console.log(salesDish[l]);

                            for (var m = 0; m < dishes.length; m++) {
                                if (dishID == dishes[m]._id) {
                                    dishes[m].count += quantity;
                                }
                            }
                        }
                    }

                    for (var n = 0; n < dishes.length; n++) 
                        dishes[n].total = parseFloat(dishes[n].count * dishes[n].price).toFixed(2);

                    res.render('viewSalesReport', {today, dishes, total, discount, VAT});
                }

                getCount(today, dishes, total, discount, VAT, salesIDs);
                
            });
        });
    },

    getFilteredRowsSalesReport: function(req, res) {
		var startDate = new Date(req.query.startDate);
		var endDate = new Date(req.query.endDate);
		startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        
        var today = new Date().toLocaleString('en-US');
        var dishes = [];
        var total = 0;
        var discount = 0;
        var VAT = 0;

        var projection = '_id dishName dishPrice dishClassification';

        db.findMany(Dishes, {}, projection, function(result) {

            for (var i = 0; i < result.length; i++) {
                var dish = {
                    _id: result[i]._id,
                    dishName: result[i].dishName,
                    count: 0,
                    price: parseFloat(result[i].dishPrice).toFixed(2),
                    total: 0
                };

                //dish.total = parseFloat(dish.count * dish.price).toFixed(2);
                //total += dish.total;
                dishes.push(dish);
            }

            //console.log(dishes);

            // look through sales 
            var projection2 = '_id date total VAT discount';
            db.findMany(Sales, {}, projection2, function(result2) {
                var salesIDs = [];

                for (var j = 0; j < result2.length; j++) {
                    var date = new Date(result2[j].date);
                    date.setHours(0,0,0,0);

                    if (!(startDate > date || date > endDate)) {
                        VAT += result2[j].VAT;
                        discount += result2[j].discount;
                        total += result2[j].total;
    
                        salesIDs.push(result2[j]._id);
                    }
                }

                //console.log(salesIDs);
                //console.log(result2);
                VAT = parseFloat(VAT).toFixed(2);
                discount = parseFloat(discount).toFixed(2);
                total = parseFloat(total).toFixed(2);

                function getSalesDish (saleID) {
                    return new Promise ((resolve, reject) => {
                        db.findMany (SalesDishes, {salesID: saleID}, 'salesID dishID quantity', function(result) {
                            //if (result!="")
                                resolve(result);
                        });
                    });
                }

                async function getCount(today, dishes, total, discount, VAT, salesIDs) {
                    for (var k = 0; k < salesIDs.length; k++) {
                        //console.log(salesIDs[k]);

                        // get salesID dishID quantity
                        var salesDish = await getSalesDish(salesIDs[k]);

                        for (var l = 0; l < salesDish.length; l++) {
                            var dishID = salesDish[l].dishID;
                            var quantity = salesDish[l].quantity;
                            //console.log(salesDish[l]);

                            for (var m = 0; m < dishes.length; m++) {
                                if (dishID == dishes[m]._id) {
                                    dishes[m].count += quantity;
                                }
                            }
                        }
                    }

                    for (var n = 0; n < dishes.length; n++) 
                        dishes[n].total = parseFloat(dishes[n].count * dishes[n].price).toFixed(2);

                    res.send(dishes);
                }

                getCount(today, dishes, total, discount, VAT, salesIDs);
                
            });
        });


    },
    
    getSalesInfo: function(req, res) {
		var startDate = new Date(req.query.startDate);
		var endDate = new Date(req.query.endDate);
		startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);

        var salesInfo = [];

        salesInfo = {
            total: 0,
            discount: 0,
            VAT: 0
        };

        var projection = '_id date total VAT discount';
        db.findMany(Sales, {}, projection, function(result) {

            for (var j = 0; j < result.length; j++) {
                var date = new Date(result[j].date);
                date.setHours(0,0,0,0);

                if (!(startDate > date || date > endDate)) {
                    salesInfo.VAT += result[j].VAT;
                    salesInfo.discount += result[j].discount;
                    salesInfo.total += result[j].total;
                }
            }

            salesInfo.VAT = parseFloat(salesInfo.VAT).toFixed(2);
            salesInfo.discount = parseFloat(salesInfo.discount).toFixed(2);
            salesInfo.total = parseFloat(salesInfo.total).toFixed(2);

            res.send(salesInfo);
        });
    },

    	//render existing inventory list
	getInventoryReport: function (req, res) {
        var today = new Date().toLocaleString('en-US');
        var ingredientProjection = '_id ingredientName ingredientType unitMeasurement reorderLevel quantityAvailable';
        var ingredients = [];

        db.findMany (Ingredients, {}, ingredientProjection, function (result) {

            for (var i = 0; i < result.length; i++) {
                var ingredient = {
                    _id: result[i]._id,
                    ingredientName: result[i].ingredientName,
                    add: 0,
                    used: 0,
                    unit: result[i].unitMeasurement,
                    unitName: "Unit Name"
                };
                ingredients.push(ingredient);
            }

            function getUnitName(unitId) {
                return new Promise ((resolve, reject) => {
                    db.findOne (Units, {_id:unitId}, 'unit', function(result){
                        if (result!="")
                            resolve(result.unit);
                    });
                });
            }

            async function compute(ingredients, today) {
                for (var i = 0; i < ingredients.length; i++) {
                    var unitName = await getUnitName (ingredients[i].unit);
                    ingredients[i].unitName = unitName;
                }
    
                res.render('viewInventoryReport', {today, ingredients});
            }

            compute(ingredients, today);
        });
    },

    getViewSpecificInventoryReport: function(req, res) {
        var ingredientID = req.params.ingredientID;

        db.findOne(Ingredients, {_id: ingredientID}, 'ingredientName', function(result) {
            var ingreidientName = result.ingredientName;

            var purchases = [];

            function getStocksPurchased(purchaseID){
                return new Promise ((resolve, reject) => {
                    var purchasedStocks = [];
                    var projection = 'stockID count';
                    db.findMany (PurchasedStock, {purchaseID:purchaseID}, projection, function(result) {
                        for (var i=0; i<result.length; i++) {
                            var purchasedStock = {
                                stockID:result[i].stockID,
                                count: result[i].count
                            };
                            purchasedStocks.push(purchasedStock);
                        }
                        if (purchasedStocks.length>0)
                            resolve(purchasedStocks);
                    
                    });
                });
            }

            function getStockIngredientInfo(stockID){
                return new Promise ((resolve, reject) => {
                    var projection = 'ingredientID stockName quantity stockUnit';
                    db.findOne (Stock, {_id: stockID}, projection, function(result) {
                        resolve(result);
                    });
                });
            }

            function getUnitName(unitId) {
                return new Promise ((resolve, reject) => {
                    db.findOne (Units, {_id:unitId}, 'unit', function(result){
                        if (result!="")
                            resolve(result.unit);
                    });
                });
            }

            async function checkPurchasedStock(purchases, ingredientID) {
                try {
                    var stocks = [];
                    for (var i = 0; i < purchases.length; i++) {

                        var purchasedStocks = await getStocksPurchased(purchases[i]._id);

                        for (var j = 0; j < purchasedStocks.length; j++) {
                            var stockID = purchasedStocks[j].stockID;

                            var stockIngredientInfo = await getStockIngredientInfo(stockID);
                            //console.log(stockIngredientInfo); // info shows

                                if (stockIngredientInfo.ingredientID == ingredientID) {
                                    var unitName = await getUnitName(stockIngredientInfo.stockUnit);

                                    var purchasedStock = {
                                        date: new Date(purchases[i].dateBought).toLocaleString('en-US'),
                                        stockName: stockIngredientInfo.stockName,
                                        quantity: stockIngredientInfo.quantity,
                                        unit: unitName,
                                        count: purchasedStocks[j].count
                                    };
    
                                    stocks.push(purchasedStock);
                                }
                            //console.log(stocks);
                        }
                    }
        
                    res.render('viewSpecificInventoryReport', {ingreidientName, stocks});
                } catch (err) {
                    console.log(err);
                }
            }

            var projection = '_id dateBought';
            db.findMany (Purchases, {}, projection, function(result2) {
                for (var i = 0; i < result2.length; i++) {
                    purchases.push(result2[i]);
                }
                checkPurchasedStock(purchases, ingredientID);
            });
        });
    }
};

module.exports = reportController;