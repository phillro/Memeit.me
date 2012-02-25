var io = require('socket.io')
var Session = require('connect').middleware.session.Session;
var parseCookie = require('connect').utils.parseCookie;
var redis = require('redis');

module.exports = function(app) {
    var self = this
    self.app = app


    this.createRedisClient = function(options) {
        options = options || {};

        var client = new redis.createClient(options.port || options.socket, options.host, options);
        if (options.pass) {
            client.auth(options.pass, function(err) {
                if (err) throw err;
            });
        }

        if (options.db) {
            var self = this;
            client.select(options.db);
            client.on("connect", function() {
                client.send_anyways = true;
                client.select(options.db);
                client.send_anyways = false;
            });
        }
        return client
    };

    this.listen = function(options, listenCallback) {

        /*var redisPubSubClient = this.createRedisClient(self.app.configSettings.redis)
         var redisClient = this.createRedisClient(self.app.configSettings.redis)*/

        /*
         var redisPubSubClient = new redis.createClient(app.configSettings.redis.port, app.configSettings.redis.host, app.configSettings.redis);
         if (app.configSettings.redis.pass) {
         redisPubSubClient.auth(app.configSettings.redis.pass, function(err) {
         if (err) throw err;
         });
         }

         if (app.configSettings.redis.db) {
         var self = this;
         redisPubSubClient.select(app.configSettings.redis.db);
         redisPubSubClient.on("connect", function() {
         redisPubSubClient.send_anyways = true;
         redisPubSubClient.select(app.configSettings.redis.db);
         redisPubSubClient.send_anyways = false;
         });
         }

         var redisClient = new redis.createClient(app.configSettings.redis.port || app.configSettings.redis.socket, app.configSettings.redis.host, app.configSettings.redis);
         if (app.configSettings.redis.pass) {
         redisClient.auth(app.configSettings.redis.pass, function(err) {
         if (err) throw err;
         });
         }

         if (app.configSettings.redis.db) {
         var self = this;
         redisClient.select(app.configSettings.redis.db);
         redisClient.on("connect", function() {
         redisClient.send_anyways = true;
         redisClient.select(app.configSettings.redis.db);
         redisClient.send_anyways = false;
         });
         }
         */

        var redisStore = new io.RedisStore({
            redisPub : app.configSettings.redis,
            redisSub : app.configSettings.redis,
            redisClient : app.configSettings.redis
        })

        var sio = io.listen(app, {store:redisStore});

        sio.set('browser client minification',app.configSettings.socketOptions.minifyJs)
        sio.set('log level', app.configSettings.socketOptions.debugLevel);
        sio.set('authorization', function (data, accept) {
            console.log('socket auth method called')
            if (data.headers.cookie) {
                data.cookie = parseCookie(data.headers.cookie);
                data.sessionID = data.cookie['connect.sid'];
                // (literally) get the session data from the session store
                app.sessionStore.get(data.sessionID, function (err, session) {
                    if (err) {
                        // if we cannot grab a session, turn down the connection
                        accept(err.message, false);
                    } else {
                        // save the session data and accept the connection
                        data.session = session;
                        accept(null, true);
                    }
                });
            } else {
                return accept('No cookie transmitted.', true);
            }
        });

        sio.sockets.on('connection', function (socket) {
            console.log('A socket with sessionID ' + socket.handshake.sessionID
                + ' connected!');
        });

        //return sio
        listenCallback(sio)


    }


}