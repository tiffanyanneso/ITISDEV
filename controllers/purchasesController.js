const db = require('../models/db.js');

const Purchases = require('../models/PurchasesModel.js');

const Employees = require('../models/EmployeesModel.js');
const { json } = require('express');

const purchasesController = {

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
};

module.exports = purchasesController;