// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const bcrypt = require('bcrypt');

const Employees = require('../models/EmployeesModel.js');


var session = require('express-session');

const logInController = {

	login: function (req, res) {
		res.render('login');
	},

  logout: function (req, res) {
     req.session.destroy(function(err) {
            if(err) throw err;
            res.redirect('/login');
        });
  },

	checkLogIn: function(req, res){
		var username = req.body.username;
		var password = req.body.password;

		var projection = "name username password position email phoneNumber"

		db.findOne(Employees, {username:username}, projection, function(result) {

			  if (result != null && result.username == username) {
                
                bcrypt.compare(password, result.password, function(err, equal) {
                    if (equal) {

                    	//add session functions here
                       // req.session.avatar = result.avatar;
                      	req.session.name = result.name;
                      	req.session.username = result.username;
                        req.session.position = result.position;

                       	console.log( req.session.username );
                        console.log( result.name );
            						console.log( result.position );
            						console.log( result.email );
            						console.log( result.phoneNumber );

  						res.send({redirect: '/dashboard'});
                    }
                    else
                    {
                    	//redirect to login error page
                    	res.send({redirect: '/login'});
                    }
                  
                })
            }
		});

	}
};


module.exports = logInController;