// import module `bcrypt`
const bcrypt = require('bcrypt');

// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

/*
    defines an object which contains functions executed as callback
    when a client requests for `signup` paths in the server
*/
const loginController = {

    /*
        executed when the client sends an HTTP GET request `/login`
        as defined in `../routes/routes.js`
    */
    getLogIn: function (req, res) {
            res.render('login');
    },

    /*
        executed when the client sends an HTTP POST request `/login`
        as defined in `../routes/routes.js`
    */
    postLogIn: function (req, res) {

        /*
            when submitting forms using HTTP POST method
            the values in the input fields are stored in `req.body` object
            each <input> element is identified using its `name` attribute
            Example: the value entered in <input type="text" name="fName">
            can be retrieved using `req.body.fName`
        */
        var username = req.body.username;
        var password = req.body.password;

        // fields to be returned
        var projection = 'avatar background username password bio followers';
        /*
            calls the function findOne()
            defined in the `database` object in `../models/db.js`
            this function adds a document to collection `users`
        */
        db.findOne(User, {username:username}, projection, function(result) {
            if (result != null && result.username == username) {
                
                bcrypt.compare(password, result.password, function(err, equal) {
                    if (equal) {
                        req.session.avatar = result.avatar;
                        req.session.username = result.username;
                        res.redirect('/profile?username=' + req.body.username);
                    }
                    else 
                        res.render('loginError');
                    
                })
                
                //res.redirect('/success?username=' + username);
                //res.redirect('/success?fName=' + fName +'&lName=' + lName + '&idNum=' + idNum)
            }
            else
                res.render('loginError');
        });
    }
}

/*
    exports the object `signupController` (defined above)
    when another script exports from this file
*/
module.exports = loginController;