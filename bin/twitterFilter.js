/**
 * Created by JetBrains PhpStorm.
 * User: philliprosen
 * Date: 2/22/12
 * Time: 1:49 PM
 * To change this template use File | Settings | File Templates.
 */
var twitter = require('ntwitter');
var conf = require('../etc/conf.js').development


var twit = new twitter({
    consumer_key:conf.twitter.consumer_key,
    consumer_secret:conf.twitter.consumer_secret,
    access_token_key:conf.twitter.access_token,
    access_token_secret:conf.twitter.access_token_secret
})

var resque = require ("resque").connect (conf.redis)


twit.stream('statuses/filter', {track:'@meme_it'}, function (stream) {
    stream.on('error',function(error){
        console.log(error)
    })
    stream.on('data', function (data) {
        console.log('Queing...')
        resque.enqueue('memeit_factory','makeMeme',data)
    });
});
