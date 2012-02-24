assert = require('assert');
MemeGenClient = require('memegenclient');
var memeGenClient = new MemeGenClient(conf.memegenerator);
var resque = require ("resque").connect (conf.redis)

var tweetStreamWorker = exports

tweetStreamWorker.matchStreams = function (tweet) {

    models.streams.matchStreamsToTerms(tweet,function(err,results){
        if(err){
            console.log(err)
        }else{
            console.log
        }

        this.succeed()
    })




}

