var faker = require('faker');

/* Database Cleaner */
var DatabaseCleaner = require('database-cleaner'); 
var mongodbCleaner = new DatabaseCleaner('mongodb');
var redisCleaner = new DatabaseCleaner('redis');
var connect = require('mongodb').connect

/* Config */
var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');
var db = require(libs + 'db/mongoose');
var redisClient = require(libs + 'db/cache');
var log = require(libs + 'log')(module);

/* Utils */
var extend = require('util')._extend;

/* Database models */
var User = require(libs + 'model/user');
var Client = require(libs + 'model/client');
var Article = require(libs + 'model/article');

/* Prepare login details for type: password */
var loginData = {grant_type: "password"};

function cleanDb(cb) {
  /* Drop the DB */
  connect(config.get('test:mongoose:uri'), function(err, database) {
    if(err) log.info("Error dropping DB");
    mongodbCleaner.clean(database, function() {
      
      database.close();
      redisCleaner.clean(redisClient, function() {
        cb();
      });
      
    });
  });
};

function setup(cb) {
  /* Create a test User and a test Client */
  var user = new User({ 
    username: config.get('test:user:username'),
    password: config.get('test:user:password'), 
  });

  var client = new Client({ 
    name: config.get('test:client:name'), 
    clientId: config.get('test:client:clientId'), 
    clientSecret: config.get('test:client:clientSecret') 
  });

  user.save(function(err, user) {
    if(err) return log.error(err);

    log.info("Test user - %s:%s", user.username, user.password);
    loginData = extend(loginData, {
      username: user.username, 
      password: user.password
    });

    client.save(function(err, client) {
      if(err) return log.error(err);
      log.info("Test client - %s:%s", client.clientId, client.clientSecret);

      loginData = extend(loginData, {
        client_id: client.clientId, 
        client_secret: client.clientSecret
      });

      /* Exit setup with a callback */
      setTimeout(function() {
        cb(loginData);
      }, 1000);
    });
  });
};

/* Takes in a faker method and randomly appends
a word to it from an array. Being an array of three with
different faker methods. */
function prepend(fakerFn) {
  var wordArray = ['Bench', 'Mongo', 'Test words', 'Article'],
      randno = Math.floor(Math.random() * wordArray.length);

  return wordArray[randno]+ ' ' + fakerFn();
};

function generateArticles(cb) {
  var articles = [{
    author: 'Iyanu Tomiwa Durotola', 
    title: 'Backend Engineer', 
    description: 'How to prevent code smell on the backend'
  },{
    author: 'John Smith Cuba', 
    title: 'Devops Engineer', 
    description: 'How to scale the server with minimum down time'
  }];

  for(var i=0; i < 10; i++) {
    articles.push({ 
      author: prepend(faker.name.findName), 
      title: prepend(faker.name.title), 
      description: prepend(faker.lorem.sentence)
    });
  }

  Article.collection.insert(articles, function(err, docs) {
    if(err) return log.error(err);
    /* Should leave some time for the database to run
    the indexing, since indexing is done on the first insert
    it fails with indexing error without a timeout. */
    setTimeout(function() {
      cb();
    }, 2000);
  });
}

module.exports = {
  setup: setup,
  cleanDb: cleanDb,
  generateArticles: generateArticles
};