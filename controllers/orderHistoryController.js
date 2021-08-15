
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Sales = require('../models/SalesModel.js');

const Employees = require('../models/EmployeesModel.js');

//import models

const orderHistoryController = {

    getOrderHistory: function (req, res) {
       /* var sales = {
            employeeID: "610c0a7076be1fa0308b0ef8",
        
            date: "7/18/20211",
        
            total: 320,
        
            VAT: 20,
        
            discount: 0
        };

        db.insertOne (Sales, sales, function (flag) {
			if (flag) {

			} 
        });*/

        var projection = '_id date total employeeID';
        var orders = [];

        db.findMany (Sales, {}, projection, function(result) {
			
			for (var i = 0; i < result.length; i++) {
                var date = new Date(result[i].date);

                var order = {
                    systemID: result[i]._id,
                    date: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                    total: parseFloat(result[i].total).toFixed(2),
                    employeeID: result[i].employeeID,
                    employeeName : "name"
                };
                orders.push(order);
            }

            db.findMany (Employees, {}, '_id name', function(result2) {
				//var employeeName = result2.name;
				
				var total = 0;

                for (var k = 0; k < orders.length; k++) {
					total += parseFloat(orders[k].total);
                    for (var l = 0; l < result2.length; l++) {
                        if (orders[k].employeeID == result2[l]._id)
                        orders[k].employeeName = result2[l].name;
                            //console.log(purchases[k].employeeID + ", " + result2[l].employeeID);
                    }
				}

				total = total.toFixed(2);

				orders.reverse();

                //console.log(purchases);
                res.render('viewOrderHistory', {orders, total});
            });
        });
    }
	
};

module.exports = orderHistoryController;