
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Dishes = require('../models/DishesModel.js');

const DishIngredients = require('../models/DishIngredientsModel.js');

const Ingredients = require('../models/IngredientsModel.js');

const DishClassification = require('../models/DishClassificationModel.js');

const DishStatus = require('../models/DishStatusModel.js');

//import models

const orderHistoryController = {

    getOrderHistory: function (req, res) {
        res.render('viewOrderHistory');
    }
	
};

module.exports = orderHistoryController;