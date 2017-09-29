var redis = require('redis');

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var hostAddr = process.env.REDIS_HOST || 'localhost';
var hostPort = process.env.REDIS_PORT || '6379';

var client = redis.createClient(hostPort, hostAddr);

client.on("error", function (err) {
  log.error('Connection error: 😠', err.message);
});

client.on("connect", function (err) {
  log.info("Connected to CACHE 🔥");
});

module.exports = client;
