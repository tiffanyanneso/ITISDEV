
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Ingredients = require('../models/IngredientsModel.js');

const Stock = require('../models/StockModel.js');

const Units = require('../models/UnitsModel.js');

const Dishes = require('../models/DishesModel.js');

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

        var projection = '_id dishName dishPrice dishClassification';

        db.findMany(Dishes, {}, projection, function(result) {

            for (var i = 0; i < result.length; i++) {
                var dish = {
                    _id: result[i]._id,
                    dishName: result[i].dishName,
                    count: 0,
                    price: parseFloat(result[i].dishPrice).toFixed(2),
                    total: parseFloat(0).toFixed(2)
                };
                dishes.push(dish);
            }

            discount = parseFloat(discount).toFixed(2);
            total = parseFloat(total).toFixed(2);
            
            res.render('viewSalesReport', {today, dishes, total, discount});
        });
    }
};

module.exports = reportController;