const db = require('../models/db.js');

const Purchases = require('../models/PurchasesModel.js');

const purchasesController = {
    getViewPurchases: function (req, res) {

        res.render('viewPurchases');
    }
};

module.exports = purchasesController;