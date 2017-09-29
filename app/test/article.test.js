var expect = require('expect.js'),
    libs = process.cwd() + '/libs/',
    app = require(libs + 'app');

var request = require('supertest')(app);

var setup = require('./setup/db.setup');

describe('Authorization : ', function() {

  var token = 'Bearer ';
  before(function(done) {
    this.timeout(3000);

    setup.cleanDb(function(){

      setup.setup(function(loginData) {
        
        /* Create a token to be used for test */
        request
          .post('/api/oauth/token')
          .send(loginData)
          .set('Content-Type', 'application/json')
          .expect(200)
          .end(function(err, res) {
            expect(res.body).to.exist;
            token += res.body.access_token;
            done();
          });
      });
    });
  });

  describe('Without a token: ', function() {
    it('a GET / should respond with a 401 unauthorized', function(done) {
      request
        .get('/')
        .set('Content-Type', 'application/json')
        .expect(401, done);
    });

    it('a GET /api/users/info should respond with a 401 unauthorized', function(done) {
      request
        .get('/api/users/info')
        .set('Content-Type', 'application/json')
        .expect(401, done);
    });

    it('a GET /routeDoesNotExist should respond with a 404', function(done) {
      request
        .get('/routeDoesNotExist')
        .set('Content-Type', 'application/json')
        .expect(404, done);
    });
  });

  describe('With a token: ', function() {

    it('a GET / should respond with a 200 OK', function(done) {
      request
        .get('/')
        .set('Content-Type', 'application/json')
        .set('Authorization', token)
        .expect(200, done);
    });

    it('a GET /api/users/info should return the user information', function(done) {
      request
        .get('/api/users/info')
        .set('Content-Type', 'application/json')
        .set('Authorization', token)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.name).to.be('TestUser');
          expect(res.body.user_id).to.exist;
          done();
        });
    });

    it('a POST /api/articles with a less than 5 character aritcle \
      title should return 400', function(done) {
      var article = {
        title: 'Art', 
        author: 'TestUser', 
        description: 'Short Article Title', 
        images: [{
          kind: 'thumbnail', 
          url: 'http://habrahabr.ru/images/write-topic.png'
        }]
      };

      request
        .post('/api/articles')
        .send(article)
        .set('Content-Type', 'application/json')
        .set('Authorization', token)
        .expect(400)
        .end(function(err, res) {
          expect(res.body.error).to.be('Validation error');
          done();
        });
    });

    it('a POST /api/articles should save an article and return 200', function(done) {
      var article = {
        title: 'Creating Test Article', 
        author: 'TestUser', 
        description: 'Backend Testing', 
        images: [{
          kind: 'thumbnail', 
          url: 'http://habrahabr.ru/images/write-topic.png'
        }]
      };

      request
        .post('/api/articles')
        .send(article)
        .set('Content-Type', 'application/json')
        .set('Authorization', token)
        .expect(200)
        .end(function(err, res) {
          expect(res.body.status).to.be('OK');
          expect(res.body.article._id).to.exist;
          done();
        });
    });

    describe('Pagination: ', function() {
      var articlesResult,
          url = '/api/articles/pages?search=Engineer&page=0&limit=2';
      
      var getArticleIds = function(data) {
        return data.map(function(article) {
          return article._id;
        });
      };

      before(function(done) {
        this.timeout(3000);
        setup.generateArticles(function(){
          /* Fetch article with a search string Engineer
          and save the result */
          
          request
            .get(url)
            .set('Content-Type', 'application/json')
            .set('Authorization', token)
            .expect(200)
            .end(function(err, res) {
              articlesResult = res.body;
              done();
            });
        });
      });

      it('a GET /api/articles/pages with a search string and pagination \
      should return cache', function(done) {
        request
          .get(url)
          .set('Content-Type', 'application/json')
          .set('Authorization', token)
          .expect(200)
          .end(function(err, res) {
            // Compare the ids as unique values
            expect(articlesResult.length).to.equal(res.body.length);

            var articlesResultIds = getArticleIds(articlesResult);
            var responseIds = getArticleIds(res.body);

            expect(articlesResultIds).to.contain(responseIds[0]);
            expect(articlesResultIds).to.contain(responseIds[1]);
            
            done();
          });
      });

      it('a GET /api/articles/pages should use the default limit ', function(done) {
        request
          .get('/api/articles/pages?search=engineer&page=1')
          .set('Content-Type', 'application/json')
          .set('Authorization', token)
          .expect(200)
          .end(function(err, res) {
            expect(err).to.be(null);
            expect(res.body.length).to.be(2);
            done();
          });
      });
    });
  });
});
