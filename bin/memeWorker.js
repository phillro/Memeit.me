assert = require('assert');
MemeGenClient = require('memegenclient');
var conf = require('../etc/conf.js').development
var memeGenClient = new MemeGenClient(conf.memegenerator);
var resque = require ("resque").connect (conf.redis)

var memeWorker = exports

memeWorker.makeMeme = function (tweet) {
    memeGenClient.instanceCreate({
        languageCode:'en',
        generatorId:'45',
        imageId:20,
        text0:tweet.text
    }).on('data', function (data) {
            console.log(data);
            if(typeof data == 'string')
                data=JSON.parse(data)
            resque.enqueue('troll_factory','trollReply',{originalTweet:tweet,meme:data})
        })
        .exec()


    this.succeed()
}

