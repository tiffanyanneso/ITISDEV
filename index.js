// import module `body-parser`
const bodyParser = require('body-parser');

// import module `express`
const express = require('express');

// import module `hbs`
const hbs = require('hbs');

// import module `routes` from `./routes/routes.js`
const routes = require('./routes/routes.js');

// import module `connect-mongo`
const MongoStore = require('connect-mongo');

// import module `database` from `./model/db.js`
const db = require('./models/db.js');

const dotenv = require(`dotenv`);

const crypto_js = require(`crypto-js`);

const bcrypt = require(`bcrypt`);

const session = require('express-session');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));

//set session variables
app.use(session( {
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
	cookie: { maxAge: 1*3600*1000 }
} ));


// set `hbs` as view engine
app.set('view engine', 'hbs');

// sets `/views/partials` as folder containing partial hbs files
hbs.registerPartials(__dirname + '/views/partials');

// parses incoming requests with urlencoded payloads
app.use(express.urlencoded({extended: true}));


// set the folder `public` as folder containing static assets
// such as css, js, and image files
app.use(express.static('public'));

// define the paths contained in `./routes/routes.js`
app.use('/', routes);



// connects to the database
db.connect();

// binds the server to a specific port
app.listen(port, function () {
    console.log('app listening at port ' + port);
});