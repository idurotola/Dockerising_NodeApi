# Node REST API with Mongo and Redis all Dockerized

REST API for mobile applications using Node.js and Express.js framework with Mongoose.js for working with MongoDB. For access control this project use OAuth 2.0, with the help of OAuth2orize and Passport.js.

## Running project

You need to have installed Node.js, MongoDB, Redis and Docker.

### Install dependencies 

To install dependencies enter project folder and run following command:
```
npm install
```

### Creating demo data

To create demo data in your MongoDB execute ```generateData.js``` file 
```
node generateData.js
```

### Run Container and server

To run server execute:
```
docker-compose up 
```

### Run server

To run server execute:
```
cd app/
node bin/www 
```

### Make Requests

Creating and refreshing access tokens:
```
http POST http://localhost:1337/api/oauth/token grant_type=password client_id=android client_secret=SomeRandomCharsAndNumbers username=myapi password=abc1234
http POST http://localhost:1337/api/oauth/token grant_type=refresh_token client_id=android client_secret=SomeRandomCharsAndNumbers refresh_token=[TOKEN]
```

Creating your article data:
```
http POST http://localhost:1337/api/articles title=NewArticle author='John Doe' description='Lorem ipsum dolar sit amet' images:='[{"kind":"thumbnail", "url":"http://habrahabr.ru/images/write-topic.png"}, {"kind":"detail", "url":"http://habrahabr.ru/images/write-topic.png"}]' Authorization:'Bearer PUT_YOUR_TOKEN_HERE'
```

Updating your article data:
```
http PUT http://localhost:1337/api/articles/YOUR_ARTICLE_ID_HERE title=NewArticleUpdated author='John Doe' description='Lorem ipsum dolar sit amet' images:='[{"kind":"thumbnail", "url":"http://habrahabr.ru/images/write-topic.png"}, {"kind":"detail", "url":"http://habrahabr.ru/images/write-topic.png"}]' Authorization:'Bearer PUT_YOUR_TOKEN_HERE'
```

Getting your data 
```
http http://localhost:1337/api/users/info Authorization:'Bearer PUT_YOUR_TOKEN_HERE'
http http://localhost:1337/api/articles Authorization:'Bearer PUT_YOUR_TOKEN_HERE'
```

## Modules used

Some of non standard modules used:
* [express](https://www.npmjs.com/package/mongoose)
* [mongoose](https://www.npmjs.com/package/mongoose)
* [nconf](https://www.npmjs.com/package/nconf)
* [winston](https://www.npmjs.com/package/winston)
* [faker](https://www.npmjs.com/package/faker)
* [oauth2orize](https://www.npmjs.com/package/oauth2orize)
* [passport](https://www.npmjs.com/package/passport)

## Tools used

[httpie](https://github.com/jkbr/httpie) - command line HTTP client

### JSHint

For running JSHint  
```
sudo npm install jshint -g
jshint libs/**/*.js generateData.js
```

## Author
This is modified from NodeApi by by Evgeny Aleksandrov ([@EAleksandrov](http://twitter.com/EAleksandrov)).

