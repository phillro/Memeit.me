//var ElasticSearchClient = require('elasticsearchclient');
var ejs = require('ejs')
    , fs = require('fs');
var redis= require("redis")

module.exports = function (app) {





    var streamHandler = app.socketHandler
        .of('/streams')
        .on('connection', function (socket) {
            console.log('client connected to stream socket')


            socket.on('followStream', function (params) {
                console.log("follow stream ")
                console.log(params)
               var client =  new redis.createClient(configSettings.redis.port, configSettings.redis.host);
                client.unsubscribe()
                client.subscribe("stream-" + params.streamId);
                client.on("message", function (channel, msg) {
                    console.log(channel + ' message received')
                    socket.emit('eventMsg', {event:'addTweet', data:{msg:msg}})
                });

            })

            socket.on('loadStreamHistory', function (params) {
                console.log('loadStreamHistory')
            })


        })
        .on('error',function(err){
            if(err){
                console.log('socket.io blocked? '+err)
            }
        })

    //return streamHandler

}