var MemeWorker =require ('./memeWorker.js')
var TrollWorker = require('./trollWorker.js')
var conf = require('../etc/conf.js').development
var resque = require ("resque").connect (conf.redis)

resque.cleanStaleWorkers ()

var memeWorker = resque.createWorker ('memeit_factory', 'makeMeme',MemeWorker )

memeWorker.start ()

var trollWorker = resque.createWorker ('troll_factory', 'trollReply',TrollWorker )

trollWorker.start()