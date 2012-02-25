//var ElasticSearchClient = require('elasticsearchclient');
var ejs = require('ejs')
    , fs = require('fs');

module.exports = function (app) {


    var streamHandler = app.socketHandler
        .of('/streams')
        .on('connection', function (socket) {
            console.log('client connected to stream socket')


            socket.on('loadStreamHistory', function (params) {
                console.log('loadStreamHistory')
            })

            socket.on('testSocket', function (params) {
                streamHandler.emit('eventMsg', {event:'addTweet', data:{}})
            })

        })

    return streamHandler

}