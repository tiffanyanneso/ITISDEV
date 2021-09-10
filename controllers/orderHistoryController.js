
// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Sales = require('../models/SalesModel.js');

const SalesDishes = require('../models/SalesDishesModel.js');

const Employees = require('../models/EmployeesModel.js');

const Dishes = require('../models/DishesModel.js');

//import models

const orderHistoryController = {

    getOrderHistory: function (req, res) {

        if( req.session.position != 'Admin' ){
            res.redirect('/dashboard');
        }
        else{   

       /* var salesOrder = {
            salesID: "2",
        
            dishID: "2",
        
            quantity: 2.2
        };

        db.insertOne (SalesDishes, salesOrder, function (flag) {
			if (flag) {

			} 
        });*/

        var projection = '_id date total employeeID';
        var orders = [];
        var today = new Date().toLocaleString('en-US');

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
                res.render('viewOrderHistory', {orders, total, today});
            });
        });
        }
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

        if( req.session.position != 'Admin' ){
            res.redirect('/dashboard');
        }
        else{   

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

                var salesDishes = [];

                // get all dishes ordered with the ID of sale
                db.findMany(SalesDishes, {salesID: sale.systemID}, projection2, function(result3) {

                    for (var i = 0; i < result3.length; i++) {
                        
                        var dish = {
                            salesID: result3[i].salesID,
                            dishID: result3[i].dishID,
                            dishName: "name",
                            quantity: result3[i].quantity,
                            unitPrice: 1,
                            amount: 1
                        };
            
                        salesDishes.push(dish);
                    }

                    //get dish name and unit price
                    var projection3 = '_id dishName dishPrice';
                    db.findMany(Dishes, {}, projection3, function(result4) {

                        for (var j = 0; j < salesDishes.length; j++) {
                            for (var k = 0; k < result4.length; k++) {
                                if (salesDishes[j].dishID == result4[k]._id) {
                                    salesDishes[j].dishName = result4[k].dishName;
                                    salesDishes[j].unitPrice = parseFloat(result4[k].dishPrice).toFixed(2);
                                    salesDishes[j].amount = (parseFloat(salesDishes[j].quantity) * parseFloat(result4[k].dishPrice)).toFixed(2);
                                }
                            }

                        }
                        
                        res.render('viewOrder', {sale, salesDishes});
                    });
                });

            
            });
        });
    }
	}
};

module.exports = orderHistoryController;