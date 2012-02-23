assert = require('assert');
MemeGenClient = require('memegenclient');
var conf = require('../etc/conf.js').development
var twitter = require('ntwitter');
var resque = require("resque").connect(conf.redis)


var twit = new twitter({
    consumer_key:conf.twitter.consumer_key,
    consumer_secret:conf.twitter.consumer_secret,
    access_token_key:conf.twitter.access_token,
    access_token_secret:conf.twitter.access_token_secret
})

var trollWorker = exports

trollWorker.trollReply = function (params) {
    console.log('troll reply....')
    var self = this

    var meme = params.meme
    var originalTweet = params.originalTweet
    if (meme.success) {
        var instanceId = meme.result.instanceID
        var imageUrl = 'http://b.images.memegenerator.net/instances/400x/' + instanceId +'.jpg'
        var text = imageUrl + ' @' + originalTweet.user.screen_name + ' #meme_troll'
        var params = {
            in_reply_to_status_id:originalTweet.id
        }
        twit.updateStatus(text, params,
            function (err, data) {
                if(err)
                    console.log(err)
                else
                    console.log(data);
                self.succeed()
            })
    } else {
        console.log('Meme was a fail')
    }


}

