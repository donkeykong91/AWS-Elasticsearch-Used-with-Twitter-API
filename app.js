var Twitter = require('twitter');
var elasticsearch = require('elasticsearch');
var express = require('express');

var app = express();
var twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var elasticSearchClient = new elasticsearch.Client({
  host: 'search-assignment4-lq2n5z4p66sep5337i5dogb27a.us-west-1.es.amazonaws.com',
  log: 'info'
});

elasticSearchClient.ping({requestTimeout: 5000}, function (error) {
  if (error) console.log('elasticsearch cluster is down!');
  else {
    console.log('All is well');

    twitterClient.stream('statuses/filter', {track: '#trump'}, function(stream) {
      stream.on('data', function(tweet) {
        console.log(JSON.stringify(tweet));

        elasticSearchClient.create({
          index: 'tweet',
          type: 'trump',
          id: tweet.id,
          body: {
            timecreated: tweet.created_at,
            timezone: tweet.user.time_zone,
            tweet: tweet.text,
            location: tweet.user.location
          }
        }, function (error, response) {
          console.log("put item successfully.")
        });
      });

      stream.on('error', function(error) {
        throw error;
      });
    });
  }
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(3000, function() {
  console.log('app listening on port 3000!');
});
