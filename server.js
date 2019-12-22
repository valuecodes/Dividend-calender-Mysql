const express = require('express');
const app = express();
const mysql = require('mysql');
const myConnection  = require('express-myconnection');
var partials = require('express-partials');
const expressLayouts = require('express-ejs-layouts');
var path = require('path');
console.log('test');
var config = require('./config');

let dbOptions = {
	host:	  config.database.host,
	user: 	  config.database.user,
	password: config.database.password,
	port: 	  config.database.port, 
	database: config.database.db
}

app.use(myConnection(mysql, dbOptions, 'pool'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');

var expressValidator = require('express-validator')
app.use(expressValidator())

var index = require('./routes/index');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressLayouts);


app.use('/', index);
app.use(express.static(__dirname + '/public'));

app.listen(3000, function(){
	console.log('Server running at port 3000: http://127.0.0.1:3000');
})
