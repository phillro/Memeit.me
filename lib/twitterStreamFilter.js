//var twitter = require('ntwitter');
var TwitterWrapper = require('./twitterWrapper')


module.exports = TwitterStreamFilter = function (app) {
    var conf = app.configSettings
    var maxConcurrentStreams = 1
    var maxTermsPerStream = 5000
    var twitterStreams = []
    var resque = require("resque").connect(conf.redis)


    function addStream(uniqueTerms) {
        var termsStr = uniqueTerms.join(",")
        var twitterWrapper = new TwitterWrapper(uniqueTerms, {conf:conf})
        console.log('Adding stream/track for: ' + uniqueTerms)
        twitterWrapper.twitter.stream('statuses/filter', {track:termsStr}, function (stream) {
            stream.on('error', function (error) {
                console.log(error)
            })
            stream.on('data', function (data) {
                console.log('Twitter Stream found:    ' + data.text)
                var tweetUsersAndTerms=parseHashTags(data.text).concat(parseUserNames(data.text))
                for(var i=0;i<tweetUsersAndTerms.length;i++){
                    tweetUsersAndTerms[i]=tweetUsersAndTerms[i].toLowerCase()
                }
                data.tweetUsersAndTerms=tweetUsersAndTerms
                data.trollMeImages = []
                //Queue for publishing
                resque.enqueue('memegenerator_factory','createMemeGeneratorMeme',data)

            });
        });
        twitterStreams.push(twitterWrapper)
    }

    function parseHashTags(text) {
        return text.match(/[#]+[A-Za-z0-9-_]+/g) || [];
    };

    function parseUserNames(text) {
        return text.match(/[@]+[A-Za-z0-9-_]+/g) || [];
    };

    return {
        //Will create multiple streams if uniqueTerms exceeds maxConcurrentStreams
        clearStreams:function (callback) {
            for (var i = 0; i < twitterStreams.length; i++) {
                twitterStreams[i].destroy
            }
            if (typeof callback == 'function')
                callback(undefined, true)
        },
        intitializeStream:function (uniqueTerms, callback) {
            var streamTerms = []
            for (var i = 0; i < uniqueTerms.length; i++) {
                if (streamTerms.length < maxTermsPerStream) {
                    streamTerms.push(uniqueTerms[i])
                }
                if ((streamTerms.length >= maxTermsPerStream) || (i == uniqueTerms.length - 1)) {
                    addStream(streamTerms)
                    streamTerms = []
                }
            }
            streamReInitPending = false
            if (typeof callback == 'function')
                callback(undefined, true)
        },

        addTermsToStream:function (termsToBeAdded, callback) {
            var termsAdded = false
            if (twitterStreams.length < maxConcurrentStreams) {
                console.log('Adding new stream.')
                addStream(termsToBeAdded)
                termsAdded = true
                if (typeof callback == 'function')
                    callback(undefined, true)
            }
            if (!termsAdded) {
                console.log('Max streams in use, reinitializing smallest stream.')
                var i = 0
                while (!termsAdded && (i < twitterStreams.length)) {
                    if ((twitterStreams[i].terms.length + termsToBeAdded.length) < maxTermsPerStream) {
                        var vauniqueTerms = twitterStreams[i].terms.concat(termsToBeAdded)
                        var twitterWrapper = twitterStreams[i]
                        twitterWrapper.twitter.destroy()
                        addStream(uniqueTerms)
                        console.log('Terms added to existing stream.')
                        if (typeof callback == 'function')
                            callback(undefined, true)
                        termsAdded = true
                    }
                    i++
                }
                if (!termsAdded) {
                    console.log('Terms could not fit in existing streams.')
                }
            }
            if (!termsAdded && (typeof callback == 'function')) {
                callback('Could not add terms.')
            }

        }
    };


}

