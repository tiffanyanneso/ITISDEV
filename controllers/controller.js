/*
    defines an object which contains functions executed as callback
    when a client requests for `index` paths in the server
*/
const controller = {

    /*
        executed when the client sends an HTTP GET request `/favicon.ico`
        as defined in `../routes/routes.js`
    */
    getFavicon: function (req, res) {
        res.status(204);
    },

    /*
        executed when the client sends an HTTP GET request `/`
        as defined in `../routes/routes.js`
    */
    getIndex: function (req, res) {
        res.redirect('/inventory');
    },



    getDashboard: function(req, res){
        if(req.session.username != null){

            var position = req.session.position;

            if(position == 'Purchasing')
                position = 'inventory';

            if(position == 'Admin')
                position = 'manager';

            res.render( position.toLowerCase()+"Dashboard", {name: req.session.name});
                    
        }
        else{
            res.render('login');
        }
    }
};

/*exports.getIndex = function (req, res) {
    res.render('index');
};*/

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;
