/**
 * Publishes finished messages to the matched stream redis channel
 */
module.exports = strollStreamWorker = {}

strollStreamWorker.publishMessage = function (data) {
    console.log('publish message called')
    models.streams.matchStreamsToTerms(data.tweetUsersAndTerms, function (err, results) {
        if (err) {
            console.log(err)
        } else {
            for (var i = 0; i < results.length; i++) {
                redisClient.publish("stream-" + results[i]._id, JSON.stringify(data))
            }
        }
    })

    this.succeed()
}

