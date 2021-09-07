
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

const DishIngredients = require('../models/DishIngredientsModel.js');

const Conversion = require('../models/ConversionModel.js');

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

        function getIngredients() {
            return new Promise ((resolve, reject) => {
                var ingredients = []
                var ingredientProjection = '_id ingredientName ingredientType unitMeasurement reorderLevel quantityAvailable';
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
                    resolve (ingredients);
                })   
            })
        }

        function getUnitName(unitId) {
            return new Promise ((resolve, reject) => {
                db.findOne (Units, {_id:unitId}, 'unit', function(result){
                    if (result!="")
                        resolve(result.unit);
                });
            });
        }

        function getPurchases() {
            return new Promise ((resolve, reject) => {
                var projection = '_id dateBought';
                db.findMany (Purchases, {}, projection, function(result) {
                    //if (result!="")
                        resolve(result);
                });
            });
        }

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
                    //console.log(purchasedStocks);
                    //console.log(purchasedStocks.length);
                    if (purchasedStocks.length>0)
                        resolve(purchasedStocks);
                
                });
            });
        }

        function getStockIngredientInfo(stockID){
            return new Promise ((resolve, reject) => {
                var projection = 'ingredientID quantity stockUnit';
                db.findOne (Stock, {_id: stockID}, projection, function(result) {
                    resolve(result);
                });
            });
        }

         function getSales () {
            return new Promise((resolve, reject) => {
                db.findMany (Sales, {}, '_id date', function (result) {
                    if (result !="")
                        resolve(result);
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

        function computeQuantityAdd(quantityAvailable, conversion) {
            return new Promise((resolve, reject) => {
                var computedQuantity = quantityAvailable;

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
            }) ;
        }

        function computeQuantityUsed(quantityAvailable, conversion, quantity) {
            return new Promise((resolve, reject) => {
                var computedQuantity = quantityAvailable;

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
                resolve (computedQuantity*quantity);
            }) ;
        }

        async function ingredientUnitNames(ingredients) {
            for (var i = 0; i < ingredients.length; i++) 
                ingredients[i].unitName = await getUnitName (ingredients[i].unit);

            return ingredients;
        }

        async function addColumn(ingredients) {
            var purchases = await getPurchases();

            //console.log(ings);
            //console.log(purchases);

            for (var j = 0; j < purchases.length; j++) {

                var purchasedStocks = await getStocksPurchased(purchases[j]._id);

                //console.log(purchasedStocks);

                for (var k = 0; k < purchasedStocks.length; k++) {
                    var stockID = purchasedStocks[k].stockID;

                    var stockIngredientInfo = await getStockIngredientInfo(stockID);
                    //console.log(stockIngredientInfo); // info shows

                   //console.log(stockIngredientInfo.length);

                    for (var l = 0; l < ingredients.length; l++) {
                        //console.log("stock ing id: " + stockIngredientInfo.ingredientID + " ing id: " + ingredients[l]._id);
                        if (stockIngredientInfo.ingredientID == ingredients[l]._id) {
                            //console.log("stock unit: " + stockIngredientInfo.stockUnit + " ing unit: " + ingredients[l].unit);
                            if (stockIngredientInfo.stockUnit == ingredients[l].unit) {
                                //console.log("add: " + ings[l].add + "stock qty: " + stockIngredientInfo.quantity + "count: " + purchasedStocks[j].count);
                                ingredients[l].add += parseFloat(stockIngredientInfo.quantity) * parseFloat(purchasedStocks[j].count);
                            } else {
                                //console.log("needs conversion");
                                
                                var conversion;

                                //checks if there is direct converion
                                conversion = await getConversion (stockIngredientInfo.stockUnit, ingredients[l].unit);
                                
                                //no direct conversion, check for indirect conversions
                                if (conversion == null || conversion == "") 
                                    conversion = await getIndirectConversion(stockIngredientInfo.stockUnit, ingredients[l].unit);

                                //console.log("IN IF " + conversion);

                               // console.log(conversion);
                                
                                //console.log("DISH NAME " + dish.dishName + "     INGREDIENT " + ingredient.ingredientName);
                                ingredients[l].add += await computeQuantityAdd(stockIngredientInfo.quantity, conversion);
                            }
                        }
                    }
                }
            }
            //console.log(ings)
            return ingredients
        }

        async function usedColumn (ingredients) {

            var sales = await getSales();
            
            for (var i=0; i<sales.length; i++) {
                //console.log("i " + i + " sales " + sales.length)
                var dishSales = await getDishSales (sales[i]._id);

                for (var j=0; j<dishSales.length; j++) {
                    //console.log("j " + j + " dishSales " + dishSales.length)
                    var dishIngredients = await getDishIngredients (dishSales[j].dishID);

                    for (var k=0; k<dishIngredients.length; k++) {
                        //console.log("k " + k + " dishIngredients " + dishIngredients.length)

                        for (var l=0; l<ingredients.length; l++) {
                            //console.log("l " + l + " ingredients " + ingredients.length)

                            if (dishIngredients[k].ingredientID == ingredients[l]._id) {

                                //need conversion
                                if (dishIngredients[k].unitMeasurement != ingredients[l].unit) {
                                    var conversion;

                                    //checks if there is direct converion
                                    conversion = await getConversion (dishIngredients[k].unitMeasurement, ingredients[l].unit);
                                    
                                    //no direct conversion, check for indirect conversions
                                    if (conversion == null || conversion == "") {
                                        conversion = await getIndirectConversion(dishIngredients[k].unitMeasurement, ingredients[l].unit);
                                    }

                                    ingredients[l].used += await computeQuantityUsed(dishIngredients[k].quantity, conversion, dishSales[j].quantity);
                                }
                               else {
                                    //console.log(dishSales[j])
                                    ingredients[l].used += (dishIngredients[k].quantity * dishSales[j].quantity)
                                    //console.log(dishIngredients[k].quantity +" " + dishSales[j].quantity)
                               }
                                    
                            }
                        }
                    }
                }
            }
            return ingredients
        } 

        async function getInventoryReport() {
            var ingredients = await getIngredients();
            ingredients = await addColumn(ingredients);
            ingrdients = await usedColumn(ingredients);
            ingredients = await ingredientUnitNames(ingredients)

            res.render('viewInventoryReport', {today, ingredients});

        }

        getInventoryReport();
    },

    getFilteredInventoryReport: function (req, res) {
        //var today = new Date().toLocaleString('en-US');
        var startDate = new Date(req.query.startDate);
        var endDate = new Date(req.query.endDate);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);

        function getIngredients() {
            return new Promise ((resolve, reject) => {
                var ingredients = []
                var ingredientProjection = '_id ingredientName unitMeasurement';
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
                    resolve (ingredients);
                })   
            })
        }

        function getUnitName(unitId) {
            return new Promise ((resolve, reject) => {
                db.findOne (Units, {_id:unitId}, 'unit', function(result){
                    if (result!="")
                        resolve(result.unit);
                });
            });
        }

        function getPurchases (startDate, endDate) {
            return new Promise ((resolve, reject) => {
                var purchases = []
                db.findMany (Purchases, {}, '_id dateBought', function(result) {
                    for (var i=0; i<result.length; i++) {
                        var date = new Date(result[i].dateBought);
                        date.setHours(0,0,0,0);

                        if (!(startDate > date || date > endDate)) 
                            purchases.push(result[i]);
                    }
                    resolve (purchases)
                })
            })
        }

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
                    //console.log(purchasedStocks);
                    //console.log(purchasedStocks.length);
                    if (purchasedStocks.length>0)
                        resolve(purchasedStocks);
                
                });
            });
        }

        function getStockIngredientInfo(stockID){
            return new Promise ((resolve, reject) => {
                var projection = 'ingredientID quantity stockUnit';
                db.findOne (Stock, {_id: stockID}, projection, function(result) {
                    resolve(result);
                });
            });
        }

         function getSales(startDate, endDate) {
            return new Promise ((resolve, reject) => {
                var sales = []
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

        function computeQuantityAdd(quantityAvailable, conversion) {
            return new Promise((resolve, reject) => {
                var computedQuantity = quantityAvailable;

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
            }) ;
        }

        function computeQuantityUsed(quantityAvailable, conversion, quantity) {
            return new Promise((resolve, reject) => {
                var computedQuantity = quantityAvailable;

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
                resolve (computedQuantity*quantity);
            }) ;
        }

        async function ingredientUnitNames(ingredients) {
            for (var i = 0; i < ingredients.length; i++) 
                ingredients[i].unitName = await getUnitName (ingredients[i].unit);

            return ingredients;
        }

        async function addColumn(ingredients) {
            var purchases = await getPurchases(startDate, endDate);

            //console.log(ings);
            //console.log(purchases);

            for (var j = 0; j < purchases.length; j++) {

                var purchasedStocks = await getStocksPurchased(purchases[j]._id);

                //console.log(purchasedStocks);

                for (var k = 0; k < purchasedStocks.length; k++) {
                    var stockID = purchasedStocks[k].stockID;

                    var stockIngredientInfo = await getStockIngredientInfo(stockID);
                    //console.log(stockIngredientInfo); // info shows

                   //console.log(stockIngredientInfo.length);

                    for (var l = 0; l < ingredients.length; l++) {
                        //console.log("stock ing id: " + stockIngredientInfo.ingredientID + " ing id: " + ingredients[l]._id);
                        if (stockIngredientInfo.ingredientID == ingredients[l]._id) {
                            //console.log("stock unit: " + stockIngredientInfo.stockUnit + " ing unit: " + ingredients[l].unit);
                            if (stockIngredientInfo.stockUnit == ingredients[l].unit) {
                                //console.log("add: " + ings[l].add + "stock qty: " + stockIngredientInfo.quantity + "count: " + purchasedStocks[j].count);
                                ingredients[l].add += parseFloat(stockIngredientInfo.quantity) * parseFloat(purchasedStocks[j].count);
                            } else {
                                //console.log("needs conversion");
                                
                                var conversion;

                                //checks if there is direct converion
                                conversion = await getConversion (stockIngredientInfo.stockUnit, ingredients[l].unit);
                                
                                //no direct conversion, check for indirect conversions
                                if (conversion == null || conversion == "") 
                                    conversion = await getIndirectConversion(stockIngredientInfo.stockUnit, ingredients[l].unit);

                                //console.log("IN IF " + conversion);

                               // console.log(conversion);
                                
                                //console.log("DISH NAME " + dish.dishName + "     INGREDIENT " + ingredient.ingredientName);
                                ingredients[l].add += await computeQuantityAdd(stockIngredientInfo.quantity, conversion);
                            }
                        }
                    }
                }
            }
            //console.log(ings)
            return ingredients
        }

        async function usedColumn (ingredients) {

            var sales = await getSales(startDate, endDate);
            
            for (var i=0; i<sales.length; i++) {
                //console.log("i " + i + " sales " + sales.length)
                var dishSales = await getDishSales (sales[i]._id);

                for (var j=0; j<dishSales.length; j++) {
                    //console.log("j " + j + " dishSales " + dishSales.length)
                    var dishIngredients = await getDishIngredients (dishSales[j].dishID);

                    for (var k=0; k<dishIngredients.length; k++) {
                        //console.log("k " + k + " dishIngredients " + dishIngredients.length)

                        for (var l=0; l<ingredients.length; l++) {
                            //console.log("l " + l + " ingredients " + ingredients.length)

                            if (dishIngredients[k].ingredientID == ingredients[l]._id) {

                                //need conversion
                                if (dishIngredients[k].unitMeasurement != ingredients[l].unit) {
                                    var conversion;

                                    //checks if there is direct converion
                                    conversion = await getConversion (dishIngredients[k].unitMeasurement, ingredients[l].unit);
                                    
                                    //no direct conversion, check for indirect conversions
                                    if (conversion == null || conversion == "") {
                                        conversion = await getIndirectConversion(dishIngredients[k].unitMeasurement, ingredients[l].unit);
                                    }

                                    ingredients[l].used += await computeQuantityUsed(dishIngredients[k].quantity, conversion, dishSales[j].quantity);
                                }
                               else {
                                    //console.log(dishSales[j])
                                    ingredients[l].used += (dishIngredients[k].quantity * dishSales[j].quantity)
                                    //console.log(dishIngredients[k].quantity +" " + dishSales[j].quantity)
                               }
                                    
                            }
                        }
                    }
                }
            }
            return ingredients
        } 

        async function getFilteredInventoryReport() {
            var ingredients = await getIngredients();
            ingredients = await addColumn(ingredients);
            ingrdients = await usedColumn(ingredients);
            ingredients = await ingredientUnitNames(ingredients)

            res.send(ingredients);

        }

        getFilteredInventoryReport();
    },

    getViewSpecificInventoryReport: function(req, res) {
        var ingredientID = req.params.ingredientID;

        function getPurchases () {
            return new Promise ((resolve, reject) => {
                db.findMany (Purchases, {}, '_id dateBought', function(result) {
                    if (result!="")
                        resolve(result);
                });
            });
        }

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

        function getSales() {
            return new Promise ((resolve, reject) => {
                db.findMany (Sales, {}, '_id date', function(result) {
                    if (result!="")
                        resolve(result);
                });
            });
        }

        function getDishes (salesID) {
            return new Promise((resolve, reject) => {
                db.findMany (SalesDishes, {salesID:salesID}, 'dishID quantity', function(result) {
                    if (result!="")
                        resolve(result);
                });
            });
        }

        function getDishIngredients (dishID) {
            return new Promise ((resolve, reject) => {
                db.findMany (DishIngredients, {dishID:dishID}, 'ingredientID quantity unitMeasurement', function (result) {
                    if (result!="")
                        resolve(result);
                });
            });
        }

        function getDishName (dishID) {
            return new Promise ((resolve, reject) => {
                db.findOne (Dishes, {_id:dishID}, 'dishName', function (result) {
                    if (result!="")
                        resolve(result.dishName);
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

        async function getInfo () {
            //GET PURCHASES
            var purchases = await getPurchases();
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

            //GET USES
            var sales = await getSales();
            //stores used ingredient, quantity and unit measurement
            var usedQuantities = [];

            for (var i=0; i<sales.length; i++) {
                var dishes = await getDishes(sales[i]._id);

                for (var j=0; j<dishes.length; j++) {
                    var dishIngredients = await getDishIngredients(dishes[j].dishID);

                    for (var k=0; k<dishIngredients.length; k++) {
                        if (dishIngredients[k].ingredientID == ingredientID) {
                            total = dishes[j].quantity * dishIngredients[k].quantity;
                            var usedQuantity = {
                                date: new Date(sales[i].date).toLocaleString('en-US'),
                                dishID: dishes[j].dishID,
                                count: dishes[j].quantity,
                                quantity: dishIngredients[k].quantity,
                                unit: dishIngredients[k].unitMeasurement,
                                total: total
                            };
                            usedQuantities.push (usedQuantity);
                        }
                    }
                }
            }

            for (var l=0; l<usedQuantities.length; l++) {
                usedQuantities[l].dishName = await getDishName (usedQuantities[l].dishID);
                usedQuantities[l].unit = await getUnitName (usedQuantities[l].unit);
            }

            db.findOne (Ingredients, {_id:ingredientID}, 'ingredientName', function(result) {
                var ingredientName = result.ingredientName;
                console.log(ingredientName);
                res.render('viewSpecificInventoryReport', {stocks, usedQuantities, ingredientName, ingredientID});
            });
        }

        getInfo();

    },

    getFilteredRowsReport: function(req, res) {
        var ingredientID = req.query.ingredientID;
        var startDate = new Date(req.query.startDate);
		var endDate = new Date(req.query.endDate);
		startDate.setHours(0,0,0,0);
		endDate.setHours(0,0,0,0);
        
        var ingredientID = req.params.ingredientID;

        function getPurchases (startDate, endDate) {
            return new Promise ((resolve, reject) => {
                var purchases = []
                db.findMany (Purchases, {}, '_id dateBought', function(result) {
                    for (var i=0; i<result.length; i++) {
                        var date = new Date(result[i].dateBought);
                        date.setHours(0,0,0,0);

                        if (!(startDate > date || date > endDate)) 
                            purchases.push(result[i]);
                    }
                    resolve (purchases)
                })
            })
        }

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

        function getSales(startDate, endDate) {
            return new Promise ((resolve, reject) => {
                var sales = []
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

        function getDishes (salesID) {
            return new Promise((resolve, reject) => {
                db.findMany (SalesDishes, {salesID:salesID}, 'dishID', function(result) {
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

        function getDishName (dishID) {
            return new Promise ((resolve, reject) => {
                db.findOne (Dishes, {_id:dishID}, 'dishName', function (result) {
                    console.log(result.dishName)
                    if (result!="")
                        resolve(result.dishName);
                })
            })
        }

        function getUnitName(unitId) {
            return new Promise ((resolve, reject) => {
                db.findOne (Units, {_id:unitId}, 'unit', function(result){
                    if (result!="")
                        resolve(result.unit);
                });
            });
        }


        async function getInfo () {
            //GET PURCHASES
            var purchases = await getPurchases(startDate, endDate);
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
                }
            }

            //GET USES
            var sales = await getSales(startDate, endDate);
            //stores used ingredient, quantity and unit measurement
            var usedQuantities = [];

            for (var i=0; i<sales.length; i++) {
                var dishes = await getDishes(sales[i]._id);

                for (var j=0; j<dishes.length; j++) {
                    var dishIngredients = await getDishIngredients(dishes[j].dishID);

                    for (var k=0; k<dishIngredients.length; k++) {

                        if (dishIngredients[k].ingredientID == req.query.ingredientID) {
                            var usedQuantity = {
                                date: new Date(sales[i].date).toLocaleString('en-US'),
                                dishID: dishes[j].dishID,
                                quantity: dishIngredients[k].quantity,
                                unit: dishIngredients[k].unitMeasurement
                            }
                            usedQuantities.push (usedQuantity)
                        }
                    }
                }
            }

            for (var l=0; l<usedQuantities.length; l++) {
                usedQuantities[l].dishName = await getDishName (usedQuantities[l].dishID);
                usedQuantities[l].unit = await getUnitName (usedQuantities[l].unit);
            }

            var results = []
            results.push (stocks);
            results.push (usedQuantities)
            res.send(results);
        }

        getInfo();
    }
};

module.exports = reportController;