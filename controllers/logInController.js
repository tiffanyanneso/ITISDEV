// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Employees = require('../models/EmployeesModel.js');

const logInController = {

	login: function (req, res) {
		res.render('login');
	},

	checkLogIn: function(req, res){
		var username = req.body.username;
		var password = req.body.password;

		var projection = "name position email phone"

		db.findOne( Employees, {username: username, password:password}, projection, function(result) {

			if(result != null){
				console.log( result.name );
				console.log( result.position );
				console.log( result.email );
				console.log( result.phone );
			}

		});

	}
};


module.exports = logInController;