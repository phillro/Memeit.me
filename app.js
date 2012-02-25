/**
 * Module dependencies.
 */
var connect = require('connect')
var RedisStore = require('connect-redis')(connect);
var redis = require("redis")
var express = require('express')
var Resource = require('express-resource')
var mongoose = require('mongoose');
var cli = require('cli').enable('status');
var TwitterStreamFilter = require('./lib/twitterStreamFilter')
var schedule = require('node-schedule');
var SocketHandler = require('./lib/socketHandler.js');
var routes = require('./routes');


//Cli provides for starting the app with command line options
cli.parse({
    env:['e', 'Environment [dev|prod]', 'string', 'dev'],
});

cli.main(function (args, options) {
    var app = module.exports = express.createServer();
    var conf = {}
    if (options.env) {
        //default to development configuration
        conf = require('./etc/conf').development
        if (options.env == 'dev') {
            app.settings.env = 'development'
        }
        if (options.env == 'prod') {
            app.settings.env = 'production'
            conf = require('./etc/conf').production
        }
    }
    GLOBAL.configSettings = app.configSettings = conf

    app.sessionStore = sessionStore = new RedisStore(app.configSettings.redis);
    GLOBAL.redisClient = new redis.createClient(configSettings.redis.port, configSettings.redis.host);
    GLOBAL.resque = new require ("resque").connect (configSettings.redis)

    //Set up the mongodb connection and models
    var memeitDbConnectionString = 'mongodb://' + app.configSettings.mongo.user + ':' + app.configSettings.mongo.password + '@' + app.configSettings.mongo.host + ':' + app.configSettings.mongo.port + '/' + app.configSettings.mongo.dbName
    var memeItDb = mongoose.createConnection(memeitDbConnectionString);
    var streamSchema = require('./models/streams')
    var streams = memeItDb.model('Streams', streamSchema);
    GLOBAL.models = {
        streams:streams
    }


    // Configuration
    app.configure(function () {
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs');
        app.use(express.bodyParser());
        var RedisStore = require('connect-redis')(express);
        app.use(express.cookieParser());
        //app.use(express.session({ secret:"keyboard cat", store:new RedisStore }));
        app.use(express.session({store:sessionStore, secret:app.configSettings.sessionSecret }));
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(__dirname + '/public'));

    });

    app.configure('development', function () {
        app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
    });

    app.configure('production', function () {
        app.use(express.errorHandler());
    });

    //set up the stream filter
    GLOBAL.twitterStreamFilter = new TwitterStreamFilter(app)
    GLOBAL.streamReInitPending = false
    GLOBAL.reinitStreams = function (callback) {
        twitterStreamFilter.clearStreams(function (err, results) {
            var self = this
            models.streams.getDistinctTerms(function (err, results) {
                if (err) {
                    callback(err)
                } else {
                    twitterStreamFilter.intitializeStream(results, function () {
                        if (typeof callback == 'function')
                            callback(undefined, true)
                    })
                }
            })
        })
    }

    var j = schedule.scheduleJob('*/1 * * * *', function () {
        if (streamReInitPending) {
            console.log('stream init pending.')
            reinitStreams()
        } else {
            console.log('No stream init pending.')
        }
    });


    //Start up the workers
    //Creates a meme image by searching memegenerator.net a
    var memeGeneratorFactoryWorker = resque.createWorker ('memegenerator_factory','createMemeGeneratorMeme',require('./lib/workers/memeGeneratorWorker') )
    memeGeneratorFactoryWorker.start()

    // trollFactoryWorker publishes finished messages to stream channels
    var trollFactoryWorker = resque.createWorker ('troll_factory','publishMessage',require('./lib/workers/trollStreamWorker') )
    trollFactoryWorker.start()



    //Wire up the resources for rest.
    //Probably should add some auth...
    var twitStreams = require('./resources/twitStreams')
    var twitStreamsResource = app.resource('streams', twitStreams, { load:twitStreams.load });
    twitStreamsResource.map('post', '/init', twitStreams.init);    // relative path accesses element (/users/1/login)

    var memegen = require('./resources/memegen')
    var memegenResource = app.resource('memegen', memegen);


    // Routes
    var socketHandler = new SocketHandler(app)

    socketHandler.listen(options, function (socketHandler) {
        GLOBAL.socketHandler = app.socketHandler = socketHandler
         require('./sockets/streamSocket')(app)


    });
    app.get('/', routes.index);


    app.listen(3000);
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

})