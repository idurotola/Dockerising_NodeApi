var mongoose = require('mongoose');

var libs = process.cwd() + '/libs/';

var log = require(libs + 'log')(module);
var config = require(libs + 'config');

// Get the database variables
var hostAddr = process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost';
var hostPort = process.env.MONGO_PORT_27017_TCP_PORT || '27017';

/* Append /test to database name when you are running the test
to keep test database from the production or 
development environment */
process.env.NODE_ENV == "test" ? hostPort += '/test' : hostPort += '/prod' ;
mongoose.connect('mongodb://' + hostAddr + ':' + hostPort);

var db = mongoose.connection;

db.on('error', function (err) {
	log.error('Connection error: 😠', err.message);
});

db.once('open', function callback () {
	log.info('Connected to DB 🔥', hostPort);
});

module.exports = mongoose;