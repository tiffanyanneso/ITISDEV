
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Sales = require('../models/SalesModel.js');

const SalesDishes = require('../models/SalesDishesModel.js');

const Employees = require('../models/EmployeesModel.js');

//import models

const orderHistoryController = {

    getOrderHistory: function (req, res) {
        /*var salesOrder = {
            salesID: "6118aaff851e8c5a035bbe5e",
        
            dishID: "611366fcac8ad60d0316266c",
        
            quantity: 2
        };

        db.insertOne (SalesDishes, salesOrder, function (flag) {
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
    },

    getFilteredRowsOrderHistory: function(req, res) {
		var startDate = new Date(req.query.startDate);
		var endDate = new Date(req.query.endDate);
		startDate.setHours(0,0,0,0);
		endDate.setHours(0,0,0,0);

		var projection = '_id date total employeeID';
		var orders = [];
		
		db.findMany(Sales, {}, projection, function(result) {
			for (var i = 0; i < result.length; i++) {
				var date = new Date(result[i].date);
				date.setHours(0,0,0,0);
				
				if (!(startDate > date || date > endDate)) {
					var order = {
						systemID: result[i]._id,
						date: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
						total: parseFloat(result[i].total).toFixed(2),
						employeeID: result[i].employeeID,
						employeeName : "name"
					};
	
					orders.push(order);
				}
			}

			db.findMany (Employees, {}, '_id name', function(result2) {

                for (var k = 0; k < orders.length; k++) {
                    for (var l = 0; l < result2.length; l++) {
                        if (orders[k].employeeID == result2[l]._id)
                            orders[k].employeeName = result2[l].name;
                            //console.log(purchases[k].employeeID + ", " + result2[l].employeeID);
                    }
				}

				//console.log(orders);

				res.send(orders);
            });
		});
	},

    getViewSpecificOrder: function (req, res) {
        var systemID = req.params.systemID;
        var projection = '_id date employeeID VAT discount total';

        db.findOne (Sales, {_id: systemID}, projection, function(result) {

            var date = new Date(result.date);

            var sale = {
                systemID: result._id,
                date: date.toLocaleString('en-US'),
                employeeID: result.employeeID,
                employeeName: "name",
                subtotal: (parseFloat(result.total) + parseFloat(result.discount) - parseFloat(result.VAT)).toFixed(2),
                VAT: parseFloat(result.VAT).toFixed(2),
                discount: parseFloat(result.discount).toFixed(2), 
                total: parseFloat(result.total).toFixed(2), 
            };

            db.findOne (Employees, {_id: sale.employeeID}, 'name', function(result2) {
                
                sale.employeeName = result2.name;

                var projection2 = '_id salesID dishID quantity';

                //console.log(sale);

                // get all dishes ordered with the _id of sale
                db.findMany(SalesDishes, {salesID: sale.systemID}, projection2, function(result2) {

                    //get dish name and unit price

                    res.render('viewOrder', {sale, result2});
                });

            
            });
        });
    }
	
};

module.exports = orderHistoryController;