
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Ingredients = require('../models/IngredientsModel.js');

const Stock = require('../models/StockModel.js');

const Units = require('../models/UnitsModel.js');

const Dishes = require('../models/DishesModel.js');

const Sales = require('../models/SalesModel.js');

const SalesDishes = require('../models/SalesDishesModel.js');

//import models

const reportController = {

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
                    unit: result[i].unitMeasurement
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
                    ingredients[i].unit = unitName;
                }
    
                res.render('viewInventoryReport', {today, ingredients});
            }

            compute(ingredients, today);
        });
    },
    
    getSpecificInventoryReport: function (req, res) {
    },

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
                            if (result!="")
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

                    res.render('viewSalesReport', {today, dishes, total, discount, VAT});
                }

                getCount(today, dishes, total, discount, VAT, salesIDs);
                
            });
        });
    }
};

module.exports = reportController;