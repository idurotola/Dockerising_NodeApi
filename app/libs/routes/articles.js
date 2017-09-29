var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var db = require(libs + 'db/mongoose');
var client = require(libs + 'db/cache');
var Article = require(libs + 'model/article');

function cache(req, res, next) {

	var searchString = req.query.search;
	var page = parseInt(req.query.page);
	var limit = parseInt(req.query.limit);

	// Create a concat of the string 
	var cacheString = 'cache_' + searchString + page + limit;

	client.get(cacheString, function (err, data) {
		if (err) {
			log.error('Internal error(%d): %s',err.message);
			throw err;
		}
		
		data ? res.send(JSON.parse(data)) : next();
	});
}

router.get('/pages', passport.authenticate('bearer', { session: false }), cache, function(req, res) {

	var searchString = req.query.search;
	var page = parseInt(req.query.page);
	
	/* When the limit is not specified it
	should  use the default value of 2 */ 
	var limit = req.query.limit ? parseInt(req.query.limit) : 2;	

	var cacheString = 'cache_' + searchString + page + limit;

	Article.find({$text: {$search: searchString}}).skip(page).limit(limit)
	.exec(function (err, articles) {
		if (!err) {
			client.set(cacheString, JSON.stringify(articles));
			return res.json(articles);
		} else {
			
			res.statusCode = 500;
			
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			
			return res.json({ 
				error: 'Server error' 
			});
		}
	});
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
	Article.find(function (err, articles) {
		if (!err) {
			return res.json(articles);
		} else {
			res.statusCode = 500;
			
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			
			return res.json({ 
				error: 'Server error' 
			});
		}
	});
});

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
	
	var article = new Article({
		title: req.body.title,
		author: req.body.author,
		description: req.body.description,
		images: req.body.images
	});

	article.save(function (err) {
		if (!err) {
			log.info("New article created with id: %s", article.id);
			return res.json({ 
				status: 'OK', 
				article:article 
			});
		} else {
			if(err.name === 'ValidationError') {
				res.statusCode = 400;
				res.json({ 
					error: 'Validation error' 
				});
			} else {
				res.statusCode = 500;
				
				log.error('Internal error(%d): %s', res.statusCode, err.message);
				
				res.json({ 
					error: 'Server error' 
				});
			}
		}
	});
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
	
	Article.findById(req.params.id, function (err, article) {
		
		if(!article) {
			res.statusCode = 404;
			
			return res.json({ 
				error: 'Not found' 
			});
		}
		
		if (!err) {
			return res.json({ 
				status: 'OK', 
				article:article 
			});
		} else {
			res.statusCode = 500;
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			
			return res.json({ 
				error: 'Server error' 
			});
		}
	});
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function (req, res){
	var articleId = req.params.id;

	Article.findById(articleId, function (err, article) {
		if(!article) {
			res.statusCode = 404;
			log.error('Article with id: %s Not Found', articleId);
			return res.json({ 
				error: 'Not found' 
			});
		}

		article.title = req.body.title;
		article.description = req.body.description;
		article.author = req.body.author;
		article.images = req.body.images;
		
		article.save(function (err) {
			if (!err) {
				log.info("Article with id: %s updated", article.id);
				return res.json({ 
					status: 'OK', 
					article:article 
				});
			} else {
				if(err.name === 'ValidationError') {
					res.statusCode = 400;
					return res.json({ 
						error: 'Validation error' 
					});
				} else {
					res.statusCode = 500;
					
					return res.json({ 
						error: 'Server error' 
					});
				}
				log.error('Internal error (%d): %s', res.statusCode, err.message);
			}
		});
	});
});

module.exports = router;
